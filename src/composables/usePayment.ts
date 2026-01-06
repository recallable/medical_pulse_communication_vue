import { ref, onUnmounted } from 'vue';
import { showSuccessToast, showFailToast } from 'vant';
import { createOrder, getOrderStatus, PaymentMethod, OrderStatus } from '@/api/order';
import type { CreateOrderParams } from '@/api/order';
import QRCode from 'qrcode';

export function usePayment() {
  const loading = ref(false);
  const showQRCode = ref(false);
  const qrCodeUrl = ref('');
  const currentOrderId = ref('');
  let pollTimer: number | null = null;
  const POLL_INTERVAL = 2000; // 2 seconds
  const POLL_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  let pollStartTime = 0;

  /**
   * 处理支付核心逻辑
   */
  const handlePayment = async (params: CreateOrderParams, idempotencyKey: string, onSuccess: () => void) => {
    if (loading.value) return;
    loading.value = true;

    try {

      const res = await createOrder(params, idempotencyKey);

      if (res.data.code === 200) {
        const { order_id, payment_info } = res.data.data;
        const { is_instant_success, payment_url, status } = payment_info;
        const payMethod = params.payment_method; // Use params method or infer if needed

        if (is_instant_success) {
          // 0元购或麦粒全额抵扣
          showSuccessToast('支付成功');
          onSuccess();
        } else {
          // 需要第三方支付
          switch (payMethod) {
            case PaymentMethod.ALIPAY:
              if (payment_url) {
                window.location.href = payment_url;
              } else {
                showFailToast('支付链接获取失败');
              }
              break;

            case PaymentMethod.WECHAT:
              if (payment_url) {
                // 生成二维码
                try {
                  qrCodeUrl.value = await QRCode.toDataURL(payment_url);
                  currentOrderId.value = order_id;
                  showQRCode.value = true;
                  // 开始轮询
                  startPolling(order_id, onSuccess);
                } catch (err) {
                  console.error('QR Code generation failed', err);
                  showFailToast('二维码生成失败');
                }
              } else {
                showFailToast('支付链接获取失败');
              }
              break;

            default:
              showFailToast('不支持的支付方式');
          }
        }
      } else {
        showFailToast(res.data.message || '创建订单失败');
      }
    } catch (error) {
      console.error('Payment error:', error);
      showFailToast('支付请求失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 轮询订单状态
   */
  const startPolling = (orderId: string, onSuccess: () => void) => {
    stopPolling();
    pollStartTime = Date.now();

    pollTimer = window.setInterval(async () => {
      // 检查超时
      if (Date.now() - pollStartTime > POLL_TIMEOUT) {
        stopPolling();
        showFailToast('支付超时，请重新下单');
        showQRCode.value = false;
        return;
      }

      try {
        const res = await getOrderStatus(orderId);
        if (res.data.code === 200) {
          const status = res.data.data.status;
          if (status === OrderStatus.COMPLETED) {
            stopPolling();
            showQRCode.value = false;
            showSuccessToast('支付成功');
            onSuccess();
          } else if (status === OrderStatus.FAILED || status === OrderStatus.CANCELLED) {
            stopPolling();
            showQRCode.value = false;
            showFailToast('支付失败或已取消');
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        // 轮询出错不立即停止，继续尝试
      }
    }, POLL_INTERVAL);
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  /**
   * 关闭支付弹窗时清理
   */
  const closePayment = () => {
    showQRCode.value = false;
    stopPolling();
  };

  // 组件卸载时确保停止轮询
  onUnmounted(() => {
    stopPolling();
  });

  return {
    loading,
    showQRCode,
    qrCodeUrl,
    handlePayment,
    closePayment
  };
}
