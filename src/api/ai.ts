import request from '@/utils/request'
import type { ResponseData } from '@/utils/request'

export interface AiSession {
    session_id: string
    last_message: string
    created_time: string
}

export interface AiMessage {
    role: 'user' | 'assistant'
    content: string
}

export interface CreateSessionResponse {
    session_id: string
}

// 创建会话
export const createSession = () => {
    return request.post<ResponseData<CreateSessionResponse>>('/api/v1/ai/chat/create-session')
}

// 获取会话列表
export const getSessionList = () => {
    return request.get<ResponseData<AiSession[]>>('/api/v1/ai/chat/session-list')
}

// 获取会话消息记录
export const getSessionMessages = (sessionId: string) => {
    return request.get<ResponseData<AiMessage[]>>('/api/v1/ai/chat/session-message', {
        params: { session_id: sessionId }
    })
}

// 聊天 (流式响应通常需要 fetch 或 EventSource，但这里先定义 fetch 调用方式供组件使用)
// 注意：axios 处理流式响应较复杂，这里建议组件内直接使用 fetch，或者在此处封装 fetch
export const chatStreamUrl = 'http://localhost:8000/api/v1/ai/chat'
