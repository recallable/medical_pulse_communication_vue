import request from '@/utils/request';
import type { ResponseData } from '@/utils/request';

export interface MedicalCourseRequest {
  /** 课程ID */
  id?: number;
  course_code?: string;
  course_name?: string;
  medical_department?: string;
  limit?: number;
  order_by?: string;
}

export interface MedicalCourseResponse {
  id: number;
  course_code: string;
  course_name: string;
  medical_department: string;
  applicable_title?: string;
  qualification_req?: string;
  compliance_record_no?: string;
  difficulty_level: number;
  class_hours: number;
  credit?: number;
  price: number;
  sale_status: number;
  valid_period_days: number;
  refund_rule?: string;
  course_desc?: string;
  status: number;
  creator_id: number;
  created_time: string;
  updated_time: string;
  ext_info?: any;
}

export interface CourseDetailResponse {
  course_detail: {
    id: number;
    course_code: string;
    course_name: string;
    medical_department: string;
    applicable_title: string;
    qualification_req: string;
    compliance_record_no: string;
    difficulty_level: number;
    class_hours: string;
    credit: string;
    price: string;
    sale_status: number;
    valid_period_days: number;
    refund_rule: string | null;
    course_desc: string;
    status: number;
    creator_id: number;
    created_time: string;
    updated_time: string;
    ext_info: {
      course_tags: string[];
      distribution_ratio: number;
      cooperative_institution: string;
    };
  };
  exist: boolean;
}

/**
 * 评价请求参数
 */
export interface CourseCommentRequest {
  course_id: number;
  rating: number;
  tags?: string[];
  content: string;
}

/**
 * 评价列表项
 */
export interface CourseCommentItem {
  id: string;
  username: string;
  user_avatar?: string;
  rating: number;
  tags?: string[];
  content: string;
  created_at: string;
}

/**
 * 评价列表响应
 */
export interface CourseCommentListResponse {
  items: CourseCommentItem[];
  total: number;
  page: number;
  size: number;
}

/**
 * 获取课程列表
 * @param data 筛选参数
 */
export const getCourseList = (data: MedicalCourseRequest) => {
  return request.post<ResponseData<MedicalCourseResponse[]>>('/api/v1/course/course-list', data);
};

/**
 * 获取课程详情
 * @param id 课程ID
 */
export const getCourseDetail = (id: number) => {
  return request.get<ResponseData<CourseDetailResponse>>(`/api/v1/course/course-detail/${id}`);
};

/**
 * 发布课程评价
 * @param data 评价数据
 */
export const createCourseComment = (data: CourseCommentRequest) => {
  return request.post<ResponseData<any>>('/api/v1/course/comment', data);
};

/**
 * 获取课程评价列表
 * @param courseId 课程ID
 * @param params 分页参数
 */
export const getCourseCommentList = (courseId: number, params: { page: number; size: number }) => {
  return request.get<ResponseData<CourseCommentListResponse>>(`/api/v1/course/comment/${courseId}`, {
    params
  });
};
