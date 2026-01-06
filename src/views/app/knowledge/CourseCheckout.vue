<template>
  <div class="checkout-page">
    <van-nav-bar title="结算中心" left-arrow @click-left="onClickLeft" fixed placeholder />

    <!-- Course Info Card -->
    <div class="course-card">
      <van-image width="100" height="100" radius="8" fit="cover"
        src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" class="course-img" />
      <div class="course-info">
        <div class="course-title">{{ courseInfo.courseName }}</div>
        <div class="course-author">{{ courseInfo.author || '名医团队' }}</div>
        <div class="price-row">
          <span class="price">¥{{ courseInfo.price }}</span>
          <span class="original-price" v-if="courseInfo.originalPrice">¥{{ courseInfo.originalPrice }}</span>
        </div>
      </div>
    </div>

    <!-- Coupon -->
    <van-cell-group class="mt-2">
      <van-cell title="优惠券/码" value="暂无可用优惠" is-link />
    </van-cell-group>

    <!-- Payment Methods -->
    <div class="payment-section mt-2">
      <div class="section-header">
        <span class="section-title">请选择支付方式</span>
        <span class="remaining-pay">还需支付 ¥{{ finalPrice }}</span>
      </div>

      <van-radio-group v-model="paymentMethod">
        <van-cell-group>
          <van-cell clickable @click="paymentMethod = PaymentMethod.WECHAT">
            <template #title>
              <div class="pay-method-title">
                <van-icon name="wechat" color="#07c160" size="24" class="mr-2" />
                <span>微信支付</span>
              </div>
            </template>
            <template #right-icon>
              <van-radio :name="PaymentMethod.WECHAT" />
            </template>
          </van-cell>

          <van-cell clickable @click="paymentMethod = PaymentMethod.ALIPAY">
            <template #title>
              <div class="pay-method-title">
                <van-icon name="alipay" color="#1989fa" size="24" class="mr-2" />
                <span>支付宝支付</span>
              </div>
            </template>
            <template #right-icon>
              <van-radio :name="PaymentMethod.ALIPAY" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>

      <!-- Grain Pay (Deduction) -->
      <van-cell center title="麦粒支付" label="剩余1麦粒">
        <template #icon>
          <van-icon name="gold-coin" color="#ff976a" size="24" class="mr-2" />
        </template>
        <template #right-icon>
          <div class="grain-switch-container">
            <span class="grain-deduct">支付¥0</span>
            <van-switch v-model="useGrain" size="24" active-color="#07c160" />
          </div>
        </template>
      </van-cell>
    </div>

    <!-- Instructions -->
    <div class="instructions mt-2">
      <div class="inst-title">支付说明</div>
      <p>1.您正在购买的是虚拟内容服务，购买后不支持退订、转让、退换，请斟酌确认。</p>
      <p>2.购买后可在“我的课程”里查看和使用；</p>
      <p>3.如有问题请联系客服：010-64405225</p>
    </div>

    <!-- Bottom Bar -->
    <div class="bottom-bar">
      <div class="price-info">
        <span class="label">应付金额:</span>
        <span class="amount">{{ finalPrice }}元</span>
        <span class="grain-info" v-if="useGrain">(麦粒支付¥0)</span>
      </div>
      <div class="confirm-btn" :class="{ 'disabled': loading }" @click="handlePayClick">
        {{ loading ? '处理中...' : '确认支付' }}
      </div>
    </div>

    <!-- WeChat QR Code Popup -->
    <van-popup v-model:show="showQRCode" :close-on-click-overlay="false" round @closed="closePayment">
      <div class="qr-popup-content">
        <div class="qr-title">微信扫码支付</div>
        <div class="qr-code-box">
          <img :src="qrCodeUrl" alt="WeChat Pay QR Code" class="qr-img" />
        </div>
        <div class="qr-tip">
          请使用微信“扫一扫”完成支付
        </div>
        <div class="qr-close" @click="closePayment">
          <van-icon name="cross" size="24" color="#999" />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showFailToast } from 'vant';
import { useRecommendation } from '@/composables/useRecommendation';
import { usePayment } from '@/composables/usePayment';
import { PaymentMethod } from '@/api/order';

const route = useRoute();
const router = useRouter();
const { trackAction } = useRecommendation();
const { loading, showQRCode, qrCodeUrl, handlePayment, closePayment } = usePayment();

// State variables
const paymentMethod = ref(PaymentMethod.WECHAT);
const useGrain = ref(true);
const idempotencyKey = ref('');

// Constants
const STORAGE_KEY_PREFIX = 'checkout_idempotency_key_';

const courseInfo = ref({
  courseId: Number(route.query.courseId) || 0,
  courseName: String(route.query.courseName || ''),
  price: Number(route.query.price) || 0,
  originalPrice: route.query.originalPrice ? Number(route.query.originalPrice) : 0,
  author: String(route.query.author || '')
});

const finalPrice = computed(() => {
  return courseInfo.value.price;
});

/**
 * Generate a UUID v4
 */
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Initialize Idempotency Key
 */
const initIdempotencyKey = () => {
  const storageKey = `${STORAGE_KEY_PREFIX}${courseInfo.value.courseId}`;
  const storedKey = sessionStorage.getItem(storageKey);

  if (storedKey) {
    idempotencyKey.value = storedKey;
  } else {
    const newKey = generateUUID();
    idempotencyKey.value = newKey;
    sessionStorage.setItem(storageKey, newKey);
  }
};

const onClickLeft = () => {
  router.back();
};

const onPaymentSuccess = () => {
  // Track purchase
  trackAction(courseInfo.value.courseId, 'purchase', finalPrice.value);

  // Clear idempotency key
  const storageKey = `${STORAGE_KEY_PREFIX}${courseInfo.value.courseId}`;
  sessionStorage.removeItem(storageKey);

  // Navigate back
  setTimeout(() => {
    router.go(-1);
  }, 1000);
};

const handlePayClick = () => {
  if (!courseInfo.value.courseId) {
    showFailToast('课程信息缺失');
    return;
  }

  handlePayment({
    course_id: courseInfo.value.courseId,
    payment_method: paymentMethod.value,
    use_grain: useGrain.value,
    amount: finalPrice.value
  }, idempotencyKey.value, onPaymentSuccess);
};

onMounted(() => {
  initIdempotencyKey();
});
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;
}

.course-card {
  display: flex;
  background: #fff;
  padding: 16px;
  gap: 12px;
}

.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.course-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-author {
  font-size: 12px;
  color: #999;
}

.price-row {
  display: flex;
  align-items: baseline;
}

.price {
  font-size: 20px;
  color: #ff5000;
  font-weight: bold;
  margin-right: 8px;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.mt-2 {
  margin-top: 10px;
}

.mr-2 {
  margin-right: 8px;
}

.payment-section {
  background: #fff;
}

.section-header {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
}

.remaining-pay {
  font-size: 14px;
  color: #666;
}

.pay-method-title {
  display: flex;
  align-items: center;
}

.grain-switch-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.grain-deduct {
  font-size: 12px;
  color: #ff976a;
}

.instructions {
  background: #fff;
  padding: 16px;
  font-size: 12px;
  color: #999;
  line-height: 1.6;
}

.inst-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 99;
}

.price-info {
  flex: 1;
  display: flex;
  align-items: baseline;
}

.label {
  font-size: 14px;
  color: #333;
}

.amount {
  font-size: 18px;
  color: #ff5000;
  font-weight: bold;
  margin: 0 4px;
}

.grain-info {
  font-size: 12px;
  color: #666;
}

.confirm-btn {
  background: #3973ff;
  color: #fff;
  padding: 8px 24px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.confirm-btn.disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

/* QR Popup Styles */
.qr-popup-content {
  width: 300px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  position: relative;
}

.qr-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.qr-code-box {
  width: 200px;
  height: 200px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-tip {
  font-size: 14px;
  color: #666;
  text-align: center;
}

.qr-close {
  position: absolute;
  top: 12px;
  right: 12px;
  cursor: pointer;
  padding: 4px;
}
</style>
