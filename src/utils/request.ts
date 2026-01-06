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

// 是否正在刷新 Token
let isRefreshing = false;
// 请求队列，用于存储在刷新 Token 期间挂起的请求
let requestsQueue: Array<(token: string) => void> = [];

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
})

/**
 * 响应拦截器
 * 用于在响应返回后处理数据，如处理错误状态码、全局错误提示等
 */
service.interceptors.response.use(
    (response: AxiosResponse<ResponseData>) => {
        const res = response.data
        
        // 处理业务状态码 401
        if (res.code === 401) {
            const config = response.config;
            return handleRefreshToken(config);
        }
        
        return response;
    },
    (error) => {
        // 处理 HTTP 状态码 401
        if (error.response && error.response.status === 401) {
            const config = error.config;
            return handleRefreshToken(config);
        }
        return Promise.reject(error);
    }
)

/**
 * 处理 Token 刷新逻辑
 */
function handleRefreshToken(config: InternalAxiosRequestConfig) {
    if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
            // 使用原生 axios 发起刷新请求，避免拦截器死循环
            // 注意：这里手动拼接了 /api 前缀以匹配 proxy 规则，因为没有使用 service 实例
            return axios.post('/api/api/v1/user/refresh-token', {
                refresh_token: refreshToken
            })
            .then(res => {
                const { code, data } = res.data;
                if (code === 200) {
                    const newToken = data.access_token;
                    // 更新本地 Token
                    localStorage.setItem('token', newToken);
                    if (data.refresh_token) {
                        localStorage.setItem('refresh_token', data.refresh_token);
                    }

                    // 执行队列中的请求
                    requestsQueue.forEach(cb => cb(newToken));
                    requestsQueue = [];

                    // 重试当前请求
                    config.headers.Authorization = `Bearer ${newToken}`;
                    return service(config);
                } else {
                    throw new Error('Refresh failed');
                }
            })
            .catch(err => {
                // 刷新失败，清除 Token 并跳转登录
                clearAuthAndRedirect();
                return Promise.reject(err);
            })
            .finally(() => {
                isRefreshing = false;
            });
        } else {
            clearAuthAndRedirect();
            return Promise.reject(new Error('No refresh token'));
        }
    } else {
        // 正在刷新中，将请求加入队列
        return new Promise((resolve) => {
            requestsQueue.push((token) => {
                config.headers.Authorization = `Bearer ${token}`;
                resolve(service(config));
            });
        });
    }
}

/**
 * 清除认证信息并重定向
 */
function clearAuthAndRedirect() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('token');
    
    // 避免重复跳转
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

export default service
