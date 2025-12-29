/**
 * 钉钉登录配置
 */
export const DINGTALK_CONFIG = {
  // 钉钉应用客户端ID
  clientId: 'dingafymrinlfauc6vpw',
  // 授权地址
  authUrl: 'https://login.dingtalk.com/oauth2/auth',
  // 回调地址（通常配置为前端地址以获取code，需与钉钉后台配置一致）
  redirectUri: `http://127.0.0.1:5173/login/home`,
  // 前端回调地址（后端处理完登录后重定向回前端的地址）
  frontendCallbackUri: `${window.location.origin}/login/account`
}

/**
 * 构建钉钉授权URL
 * 根据后端代码格式构建
 * @returns {string} 钉钉授权URL
 */
export const buildDingTalkAuthUrl = (): string => {


  // 按照后端代码的格式构建参数
  const params = [
    `redirect_uri=${encodeURIComponent(DINGTALK_CONFIG.redirectUri)}`,
    'response_type=code',
    `client_id=${DINGTALK_CONFIG.clientId}`,
    'scope=openid',
    'prompt=consent'
  ]

  return `${DINGTALK_CONFIG.authUrl}?${params.join('&')}`
}

