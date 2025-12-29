import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

/**
 * 响应数据接口
 * @template T 响应数据的类型，默认是 any
 */
export interface ResponseData<T = any> {
    code: number;
    data: T;
    message: string;
}
/**
 * 自定义 Axios 实例
 * 用于处理 HTTP 请求和响应，包括全局配置、拦截器和响应处理
 */
const service = axios.create({
    // 默认配置，非登录页面使用
    baseURL: '/api',
    timeout: 100000,
    headers: {
        'Content-Type': 'application/json'
    }
})

/**
 * 请求拦截器
 * 用于在请求发送前添加全局配置，如添加认证 token
 */
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
}, (error) => {
    return Promise.reject(error);
}
)

/**
 * 响应拦截器
 * 用于在响应返回后处理数据，如处理错误状态码、全局错误提示等
 */
service.interceptors.response.use((response: AxiosResponse<ResponseData>) => {
    const res = response.data
    if (res.code === 401) {
        window.location.href = '/login'
    }
    return response;
})

export default service