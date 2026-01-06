<template>
	<div class="account-login-page">
		<div class="status-bar"></div>

		<div class="header">
			<el-icon class="back-icon" @click="goBack">
				<ArrowLeft />
			</el-icon>
			<span class="header-title">账号密码登录</span>
		</div>

		<div class="login-content">
			<!-- Logo区域 -->
			<div class="logo-section">
				<div class="logo-icon">
					<div class="logo-z">Z</div>
				</div>
			</div>

			<!-- 登录表单 -->
			<div class="login-form">
				<el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0">
					<el-form-item prop="account">
						<el-input v-model="loginForm.account" placeholder="请输入手机号/账号" size="large" clearable
							:prefix-icon="User" />
					</el-form-item>

					<el-form-item prop="password">
						<el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large"
							show-password clearable :prefix-icon="Lock" @keyup.enter="handleLogin" />
					</el-form-item>

					<el-form-item>
						<div class="form-footer">
							<el-checkbox v-model="rememberMe">记住密码</el-checkbox>
							<span class="forgot-password" @click="handleForgotPassword">忘记密码？</span>
						</div>
					</el-form-item>

					<el-form-item>
						<el-button type="primary" class="login-btn" size="large" :loading="loading"
							@click="handleLogin">
							登录
						</el-button>
					</el-form-item>
				</el-form>
			</div>

			<!-- 第三方登录 -->
			<div class="third-party-login">
				<div class="divider">
					<span class="divider-line"></span>
					<span class="divider-text">第三方登录</span>
					<span class="divider-line"></span>
				</div>

				<div class="third-party-buttons">
					<div class="third-party-btn" @click="handleDingTalkLogin()" :class="{ 'loading': dingTalkLoading }">
						<div class="dingtalk-icon" v-if="!dingTalkLoading">
							<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"
									fill="#1677FF" />
								<path
									d="M512 140c-205.4 0-372 166.6-372 372s166.6 372 372 372 372-166.6 372-372-166.6-372-372-372zm0 664c-161.3 0-292-130.7-292-292S350.7 220 512 220s292 130.7 292 292-130.7 292-292 292z"
									fill="#1677FF" />
								<path
									d="M512 256c-141.4 0-256 114.6-256 256s114.6 256 256 256 256-114.6 256-256-114.6-256-256-256zm0 448c-106 0-192-86-192-192s86-192 192-192 192 86 192 192-86 192-192 192z"
									fill="#1677FF" />
							</svg>
						</div>
						<el-icon v-else class="loading-icon">
							<Loading />
						</el-icon>
						<span>钉钉登录</span>
					</div>
				</div>
			</div>

			<!-- 协议 -->
			<div class="agreement">
				<el-checkbox v-model="agreed" class="agreement-checkbox">
					<span class="agreement-text">
						我已阅读并同意
						<span class="link" @click="handleAgreement('privacy')">《隐私协议》</span>
						和
						<span class="link" @click="handleAgreement('user')">《用户协议》</span>
					</span>
				</el-checkbox>
			</div>
		</div>

		<div class="bottom-bar"></div>
	</div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Loading, Lock, User } from '@element-plus/icons-vue'
import { phoneLogin } from '@/api/auth.ts'
import { buildDingTalkAuthUrl } from '@/config/dingtalk.ts'

const router = useRouter()
const route = useRoute()
const loginFormRef = ref(null)
const loading = ref(false)
const dingTalkLoading = ref(false)
const rememberMe = ref(false)
const agreed = ref(false)

const loginForm = reactive({
	account: '',
	password: ''
})

const loginRules = {
	account: [
		{ required: true, message: '请输入手机号/账号', trigger: 'blur' },
		{ min: 5, max: 20, message: '账号长度为5-20个字符', trigger: 'blur' }
	],
	password: [
		{ required: true, message: '请输入密码', trigger: 'blur' },
		{ min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
	]
}

const goBack = () => {
	router.back()
}

// 账号密码登录
const handleLogin = async () => {
	if (!agreed.value) {
		ElMessage.warning('请先同意相关协议')
		return
	}

	if (!loginFormRef.value) return

	await loginFormRef.value.validate(async (valid) => {
		if (!valid) return

		loading.value = true
		try {
			const response = await phoneLogin({
				username: loginForm.account,
				password: loginForm.password,
				login_type: "account"
			})
			console.log(response.data);

			if (response.data.code === 200) {
				// 保存token
				if (response.data.data && response.data.data.token) {
					localStorage.setItem('token', response.data.data.token.access_token)
					localStorage.setItem('refresh_token', response.data.data.token.refresh_token)
					localStorage.setItem('userInfo', JSON.stringify(response.data.data.user))

					// 记住密码
					if (rememberMe.value) {
						localStorage.setItem('rememberedAccount', loginForm.account)
						localStorage.setItem('rememberedPassword', loginForm.password)
					} else {
						localStorage.removeItem('rememberedAccount')
						localStorage.removeItem('rememberedPassword')
					}
				}
				ElMessage.success('登录成功')
				// 登录成功后跳转到首页
				router.push('/app/home')
			} else {
				ElMessage.error(response.message || '登录失败，请重试')
			}
		} catch (error) {
			ElMessage.error(error.message || '登录失败，请重试')
			console.error('登录失败:', error)
		} finally {
			loading.value = false
		}
	})
}
// 钉钉
const handleDingTalkLogin = async () => {
	if (!agreed.value) {
		ElMessage.error('请先同意协议')
		return
	}
	loading.value = true
	window.location.href = buildDingTalkAuthUrl()
}

// 页面加载时检查是否有code参数（钉钉回调）
onMounted(() => {
	// 恢复记住的账号密码
	const rememberedAccount = localStorage.getItem('rememberedAccount')
	const rememberedPassword = localStorage.getItem('rememberedPassword')
	if (rememberedAccount && rememberedPassword) {
		loginForm.account = rememberedAccount
		loginForm.password = rememberedPassword
		rememberMe.value = true
	}
})

// 忘记密码
const handleForgotPassword = () => {
	ElMessage.info('忘记密码功能开发中')
	// TODO: 跳转到忘记密码页面
}

// 查看协议
const handleAgreement = (type) => {
	const agreements = {
		privacy: '隐私协议',
		user: '用户协议'
	}
	console.log('查看协议:', agreements[type])
	// TODO: 打开协议页面
}
</script>

<style scoped>
.account-login-page {
	min-height: 100vh;
	background: #ffffff;
	display: flex;
	flex-direction: column;
}

.status-bar {
	height: 44px;
}

.header {
	display: flex;
	align-items: center;
	padding: 12px 16px;
	border-bottom: 1px solid #ebeef5;
}

.back-icon {
	font-size: 20px;
	color: #303133;
	cursor: pointer;
	margin-right: 12px;
}

.header-title {
	font-size: 18px;
	font-weight: 500;
	color: #303133;
}

.login-content {
	flex: 1;
	padding: 40px 24px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.logo-section {
	margin-bottom: 40px;
}

.logo-icon {
	width: 80px;
	height: 80px;
	background: #409eff;
	border-radius: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.logo-z {
	color: white;
	font-size: 48px;
	font-weight: bold;
	font-family: Arial, sans-serif;
}

.login-form {
	width: 100%;
	max-width: 360px;
}

:deep(.el-form-item) {
	margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
	border-radius: 8px;
}

.form-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
}

.forgot-password {
	font-size: 14px;
	color: #409eff;
	cursor: pointer;
}

.forgot-password:hover {
	text-decoration: underline;
}

.login-btn {
	width: 100%;
	height: 50px;
	font-size: 16px;
	font-weight: 500;
	border-radius: 25px;
	margin-top: 10px;
}

.third-party-login {
	width: 100%;
	max-width: 360px;
	margin-top: 40px;
}

.divider {
	display: flex;
	align-items: center;
	margin-bottom: 24px;
}

.divider-line {
	flex: 1;
	height: 1px;
	background: #e4e7ed;
}

.divider-text {
	padding: 0 16px;
	font-size: 14px;
	color: #909399;
}

.third-party-buttons {
	display: flex;
	justify-content: center;
	gap: 20px;
}

.third-party-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 80px;
	padding: 16px;
	background: #f5f7fa;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.3s;
}

.third-party-btn:hover {
	background: #ecf5ff;
	transform: translateY(-2px);
}

.third-party-btn.loading {
	opacity: 0.6;
	cursor: not-allowed;
	pointer-events: none;
}

.loading-icon {
	font-size: 24px;
	color: #409eff;
	animation: rotating 2s linear infinite;
}

@keyframes rotating {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

.third-party-btn span {
	margin-top: 8px;
	font-size: 12px;
	color: #303133;
}

.dingtalk-icon {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dingtalk-icon svg {
	width: 100%;
	height: 100%;
}

.agreement {
	width: 100%;
	max-width: 360px;
	margin-top: 30px;
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
}

/* 移动端适配 */
@media (max-width: 768px) {
	.login-content {
		padding: 30px 16px;
	}

	.logo-icon {
		width: 70px;
		height: 70px;
	}

	.logo-z {
		font-size: 42px;
	}
}
</style>
