import request from '@/utils/request'
import type { ResponseData } from '@/utils/request'

export interface Article {
    id: number
    title: string
    content: string
    description: string
    comment_count: number
    type: string
    url: string
    thumb: string
    input_time: string
}

export interface ArticleListParams {
    article_id: number
    limit: number
}

/**
 * 获取首页文章列表
 * @param data 请求参数
 */
export const getArticleList = (data: ArticleListParams) => {
    return request.post<ResponseData<Article[]>>('/api/v1/home/article-list', data)
}
