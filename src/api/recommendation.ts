import request from '@/utils/request';
import type { ResponseData } from '@/utils/request';

// 行为类型枚举
export type ActionType = 'view' | 'favorite' | 'unfavorite' | 'purchase' | 'study' | 'rate';

// 行为记录请求参数
export interface BehaviorRecordParams {
  course_id: number;
  action_type: ActionType;
  action_value?: string | number | null;
  extra_info?: Record<string, any>;
}

// 推荐课程模型
export interface RecommendedCourse {
  course_id: number;
  course_code: string;
  course_name: string;
  medical_department: string;
  difficulty_level: 1 | 2 | 3 | 4; // 1-入门、2-进阶、3-高阶、4-专家
  price: number;
  recommendation_score?: number;
  recommendation_reason?: string;
  thumb?: string; // 前端补充字段，用于展示图片（虽然API文档没写，但卡片需要）
}

// 推荐响应数据结构
export interface RecommendationResponse {
  user_id?: number;
  total: number;
  recommendations: RecommendedCourse[];
}

// 热门课程响应数据结构
export interface HotCourseResponse {
  total: number;
  courses: RecommendedCourse[];
}

/**
 * 记录用户行为
 */
export const recordBehavior = (data: BehaviorRecordParams) => {
  return request.post<ResponseData<null>>('/api/v1/recommendation/record-behavior', data);
};

/**
 * 获取课程推荐
 * @param top_n 推荐数量
 * @param exclude_interacted 是否排除已交互过的课程
 */
export const getCourseRecommendation = (top_n: number = 10, exclude_interacted: boolean = true) => {
  return request.post<ResponseData<RecommendationResponse>>('/api/v1/recommendation/course-recommend', {
    top_n,
    exclude_interacted
  });
};

/**
 * 获取热门课程（无需登录）
 * @param top_n 数量
 */
export const getHotCourses = (top_n: number = 10) => {
  return request.post<ResponseData<HotCourseResponse>>(`/api/v1/recommendation/hot-courses?top_n=${top_n}`);
};

/**
 * 快捷行为：浏览
 */
export const viewCourse = (course_id: number) => {
  return request.post<ResponseData<null>>(`/api/v1/recommendation/view/${course_id}`);
};

/**
 * 快捷行为：收藏
 */
export const favoriteCourse = (course_id: number) => {
  return request.post<ResponseData<null>>(`/api/v1/recommendation/favorite/${course_id}`);
};

/**
 * 快捷行为：购买
 */
export const purchaseCourse = (course_id: number) => {
  return request.post<ResponseData<null>>(`/api/v1/recommendation/purchase/${course_id}`);
};
