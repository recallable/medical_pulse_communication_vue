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
