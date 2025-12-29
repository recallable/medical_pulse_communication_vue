import request from '@/utils/request'
import type { ResponseData } from '@/utils/request'

/**
 * 聊天消息接口
 * 包含角色（用户或助手）和消息内容
 */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * 聊天响应接口
 * 包含助手的回复消息
 */
export interface ChatResponse {
  reply: string
}

/**
 * 好友信息接口
 * 包含好友 ID、用户名、头像 URL、在线状态、最后一条消息和未读消息数量
 */
export interface FriendInfo {
  friend_id: number
  friend_username: string
  avatar: string
  status?: 'online' | 'offline'
  last_message?: string
  unread_count?: number
}

/**
 * 聊天记录接口
 * 包含消息 ID、发送者 ID、接收者 ID、消息内容、消息类型和创建时间
 */
export interface ChatHistoryItem {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  type: 'text' | 'image' | 'audio'
  created_at: string
}

/**
 * 发送对话消息 (AI)
 * @param message 用户发送的消息内容
 * @returns 包含助手回复的响应数据
 */
export const sendChatMessage = (message: string) => {
  return request.post<ResponseData<ChatResponse>>('/ai/chat', { message })
}

/**
 * 获取好友列表
 * @returns 包含好友信息的响应数据
 */
export const getFriendList = () => {
  return request.get<ResponseData<FriendInfo[]>>('/api/v1/user/friendships')
}

/**
 * 获取聊天记录
 * @param friendId 好友 ID
 * @param params 分页参数（可选）
 * @returns 包含聊天记录的响应数据
 */
export const getChatHistory = (friendId: number, params?: { page?: number, page_size?: number }) => {
  return request.get<ResponseData<ChatHistoryItem[]>>(`/user/chat/history/${friendId}`, { params })
}
