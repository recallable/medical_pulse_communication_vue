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
          <van-cell clickable @click="paymentMethod = 'wechat'">
            <template #title>
              <div class="pay-method-title">
                <van-icon name="wechat" color="#07c160" size="24" class="mr-2" />
                <span>微信支付</span>
              </div>
            </template>
            <template #right-icon>
              <van-radio name="wechat" />
            </template>
          </van-cell>

          <van-cell clickable @click="paymentMethod = 'alipay'">
            <template #title>
              <div class="pay-method-title">
                <van-icon name="alipay" color="#1989fa" size="24" class="mr-2" />
                <span>支付宝支付</span>
              </div>
            </template>
            <template #right-icon>
              <van-radio name="alipay" />
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
      <div class="confirm-btn" @click="handlePay">确认支付</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showSuccessToast, showFailToast } from 'vant';
import { useRecommendation } from '@/composables/useRecommendation';
import { createOrder } from '@/api/order';

const route = useRoute();
const router = useRouter();
const { trackAction } = useRecommendation();

// State variables
const paymentMethod = ref('wechat');
const useGrain = ref(true);
const loading = ref(false);
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
  // Logic to deduct grain if needed. For now, we assume simple deduction logic or just display price.
  // In a real scenario, you'd calculate this based on grain balance.
  return courseInfo.value.price;
});

/**
 * Generate a UUID v4
 * Falls back to a random string if crypto is not available
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
 * Checks sessionStorage first to handle page refreshes (Persistence)
 */
const initIdempotencyKey = () => {
  const storageKey = `${STORAGE_KEY_PREFIX}${courseInfo.value.courseId}`;
  const storedKey = sessionStorage.getItem(storageKey);

  if (storedKey) {
    idempotencyKey.value = storedKey;
    console.log('Restored idempotency key from session:', storedKey);
  } else {
    const newKey = generateUUID();
    idempotencyKey.value = newKey;
    sessionStorage.setItem(storageKey, newKey);
    console.log('Generated new idempotency key:', newKey);
  }
};

const onClickLeft = () => {
  router.back();
};

/**
 * Create Order Function
 * Implements robust idempotency and error handling
 */
const handlePay = async () => {
  if (loading.value) return;

  // Basic validation
  if (!courseInfo.value.courseId) {
    showFailToast('课程信息缺失');
    return;
  }

  loading.value = true;

  try {
    // API Request with Idempotency-Key header
    const response = await createOrder({
      course_id: courseInfo.value.courseId,
      payment_method: paymentMethod.value,
      use_grain: useGrain.value,
      amount: finalPrice.value
    }, idempotencyKey.value);

    if (response.data.code === 200) {
      // Success Flow
      showSuccessToast('支付成功');

      // Track the purchase action
      trackAction(courseInfo.value.courseId, 'purchase', finalPrice.value);

      // Remove the key from sessionStorage to prevent reuse for a new order
      const storageKey = `${STORAGE_KEY_PREFIX}${courseInfo.value.courseId}`;
      sessionStorage.removeItem(storageKey);

      // Navigate to success page or course detail
      // In a real app, you might redirect to an order status page
      setTimeout(() => {
        router.go(-1); // Or router.push('/order/success')
      }, 1000);
    } else {
      // Handle business errors (e.g., inventory issues, logic errors)
      showFailToast(response.data.message || '支付失败');
      // We do NOT clear the key here, allowing the user to retry with the same key if it was a transient failure
    }
  } catch (error) {
    // Error Flow (Network error, timeout, etc.)
    console.error('Create order error:', error);
    showFailToast('网络请求失败，请重试');
    // DO NOT clear or regenerate the key. Keep the same UUID to allow safe retries.
  } finally {
    loading.value = false;
  }
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
}
</style>
