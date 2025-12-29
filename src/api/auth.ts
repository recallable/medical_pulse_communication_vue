import api from '@/utils/request'

/**
 * 登录相关API
 */

/**
 * 手机号登录
 * @param data 包含手机号和密码的登录数据
 * @returns 登录成功后的响应数据
 */
export const phoneLogin = (data: { phone: string, password: string }) => {
    return api.post('/api/v1/user/login', data)
}

/**
 * 钉钉登录
 * @param data 包含钉钉登录码的登录数据
 * @returns 登录成功后的响应数据
 */
export const dingTalkLogin = (data: { code: string }) => {
    return api.post('/api/v1/user/login', {
        login_type: 'dingtalk',
        code: data.code
    })
}