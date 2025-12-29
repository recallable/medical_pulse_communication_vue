import request from '@/utils/request'
import type { ResponseData } from '@/utils/request'


/**
 * OCR 识别结果数据接口
 * 包含姓名、身份证号和文件 ID
 */
export interface OcrData {
  name: string
  id_card: string
  file_id: number
}

/**
 * OCR 接口返回的内部包装结构（轮询成功时返回的 data.data 结构）
 */
export interface OcrInnerResult {
  code: number
  message: string
  data: OcrData
}

/**
 * OCR 轮询状态接口
 * 包含任务状态、可选信息、错误信息和成功时的 OCR 数据
 */
export interface OcrStatusResult {
  status: 'PENDING' | 'SUCCESS' | 'FAILURE'
  info?: string
  error?: string
  data?: OcrInnerResult // 成功时包含数据
}

/**
 * 异步 OCR 上传返回结构 (假设返回 task_id)
 */
export interface OcrUploadResponse {
  task_id: string
}

/**
 * 普通文件上传结果接口
 * 包含文件 ID 和可选的 URL 路径
 */
export interface UploadResult {
  file_id: number
  url?: string
}

/**
 * 实名认证参数接口
 * 包含真实姓名、身份证号、身份证正面和反面的文件 ID
 */
export interface CertificationParams {
  real_name: string
  id_card: string
  id_card_front: string // 存储 file_id
  id_card_back: string // 存储 file_id
}

/**
 * 上传图片并开启 OCR 任务 (身份证正面)
 * @param file 要上传的文件对象
 * @param side 身份证正反面标识 ('front' 或 'back')
 * @returns 包含 task_id 的响应数据
 */
export const uploadOcr = (file: File, side: 'front' | 'back') => {
  const formData = new FormData()
  formData.append('file', file)
  // 返回 task_id
  return request.post<ResponseData<OcrUploadResponse>>(`/api/v1/user/identity/ocr?side=${side}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取 OCR 任务状态
 * @param taskId OCR 任务 ID
 * @returns 包含 OCR 任务状态的响应数据
 */
export const getOcrStatus = (taskId: string) => {
  return request.get<ResponseData<OcrStatusResult>>(`/api/v1/user/identity/ocr/status/${taskId}`)
}

/**
 * 普通文件上传 (身份证反面)
 * @param file 要上传的文件对象
 * @returns 包含文件 ID 和可选 URL 路径的响应数据
 */
export const uploadFile = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<ResponseData<UploadResult>>('/api/v1/minio/upload', formData, {
    params: {
      module: 1
    },
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 提交实名认证
 * @param data 包含真实姓名、身份证号、身份证正面和反面的文件 ID 数据
 * @returns 包含空响应数据的 Promise
 */
export const submitCertification = (data: CertificationParams) => {
  return request.post<ResponseData<null>>('/api/v1/user/certification', data)
}
