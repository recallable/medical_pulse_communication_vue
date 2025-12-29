<template>
  <div class="login-page">
    <!-- 状态栏占位 -->
    <div class="status-bar"></div>

    <!-- 顶部导航 -->
    <div class="top-nav">
      <span class="other-login" @click="handleOtherLogin">账号密码登录</span>
    </div>

    <!-- 主要内容 -->
    <div class="login-content">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-bg">
          <div class="logo-icon">
            <div class="logo-z">Z</div>
          </div>
        </div>
      </div>

      <!-- 标题 -->
      <div class="title">快速注册查看海量商机</div>

      <!-- 手机号显示 -->
      <div class="phone-number">{{ maskedPhone }}</div>

      <!-- 一键登录按钮 -->
      <el-button class="login-btn" type="primary" @click="handleOneClickLogin" :loading="loading">
        本机号码一键登录
      </el-button>

      <!-- 协议勾选 -->
      <div class="agreement">
        <el-checkbox v-model="agreed" class="agreement-checkbox">
          <span class="agreement-text">
            我已阅读并同意
            <span class="link" @click="handleAgreement('tianyi')">《天翼账号服务与隐私协议》</span>
            和
            <span class="link" @click="handleAgreement('privacy')">《隐私协议》</span>
            和
            <span class="link" @click="handleAgreement('user')">《用户协议》</span>
          </span>
        </el-checkbox>
      </div>
    </div>

    <!-- 底部导航条占位 -->
    <div class="bottom-bar"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { buildDingTalkAuthUrl } from '@/config/dingtalk'

const router = useRouter()
const loading = ref(false)
const agreed = ref(false)
const phoneNumber = ref('')

// 掩码手机号
const maskedPhone = computed(() => {
  if (phoneNumber.value && phoneNumber.value.length === 11) {
    return phoneNumber.value.slice(0, 3) + '****' + phoneNumber.value.slice(7)
  }
  return '153****5127' // 默认显示
})

const handleOneClickLogin = () => {
  if (!agreed.value) {
    ElMessage.error('请先同意协议')
    return
  }
  loading.value = true
  const url = buildDingTalkAuthUrl()
  console.log(url);

  window.location.href = buildDingTalkAuthUrl()
}
// 跳转到账号密码登录页面
const handleOtherLogin = () => {
  router.push('/login/account')
}

// 查看协议
const handleAgreement = (type) => {
  const agreements = {
    tianyi: '天翼账号服务与隐私协议',
    privacy: '隐私协议',
    user: '用户协议'
  }
  console.log('查看协议:', agreements[type])
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  position: relative;
  display: flex;
  flex-direction: column;
}

.status-bar {
  height: 44px;
  background: transparent;
}

.top-nav {
  padding: 10px 20px;
  text-align: right;
}

.other-login {
  font-size: 14px;
  color: #409eff;
  cursor: pointer;
}

.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.logo-section {
  margin-bottom: 40px;
  position: relative;
}

.logo-bg {
  position: relative;
  width: 120px;
  height: 120px;
}

.logo-icon {
  width: 120px;
  height: 120px;
  background: #409eff;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
  position: relative;
  z-index: 2;
}

.logo-z {
  color: white;
  font-size: 64px;
  font-weight: bold;
  font-family: Arial, sans-serif;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 30px;
  text-align: center;
}

.phone-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 40px;
  letter-spacing: 2px;
}

.login-btn {
  width: 100%;
  max-width: 320px;
  height: 50px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 25px;
  margin-bottom: 30px;
}

.agreement {
  width: 100%;
  max-width: 320px;
  display: flex;
  align-items: flex-start;
}

:deep(.agreement-checkbox) {
  align-items: flex-start;
}

:deep(.agreement-checkbox .el-checkbox__label) {
  font-size: 12px;
  line-height: 1.6;
  color: #606266;
  white-space: normal;
}

.agreement-text {
  display: inline-block;
}

.link {
  color: #409eff;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

.bottom-bar {
  height: 34px;
  background: transparent;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .login-content {
    padding: 30px 16px;
  }

  .logo-icon {
    width: 100px;
    height: 100px;
  }

  .logo-z {
    font-size: 56px;
  }

  .title {
    font-size: 18px;
  }

  .phone-number {
    font-size: 28px;
  }
}
</style>
