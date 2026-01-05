import request from '@/utils/request';
import type { ResponseData } from '@/utils/request';

// 搜索筛选条件
export interface SearchFilters {
    department?: string;
    doctor_name?: string;
    min_age?: number;
    max_age?: number;
    extend_key?: string;
    extend_value?: string;
}

// 搜索请求参数
export interface SearchRequest {
    keyword?: string;
    page: number;
    size: number;
    filters?: SearchFilters;
}

// 病例原始数据结构
export interface CaseRawData {
    symptoms: string;
    patient_name: string;
    record_no: string;
    admission_time: string;
    extend_info: {
        "并发症"?: string | null;
        "特殊医嘱"?: string[];
        "随访周期"?: string[];
        "检查指标"?: string;
        [key: string]: any;
    };
    discharge_time: string | null;
    disease_name: string;
    diagnosis_conclusion: string;
    treatment_plan: string;
    patient_gender: string;
    patient_id: string;
    department: string;
    visit_type: string;
    doctor_name: string;
    patient_age: number;
    updated_time: string;
}

// 病例列表项结构
export interface CaseItem {
    id: number | null;
    record_no: string;
    patient_name: string;
    age: number;
    department: string;
    score: number;
    highlight_disease: string;
    highlight_symptoms: string;
    raw_data: CaseRawData;
    // 前端辅助字段
    images?: string[]; // 模拟图片字段
}

// 搜索响应结构
export interface SearchResponse {
    total: number;
    took_ms: number;
    results: CaseItem[];
}

/**
 * 获取病例列表
 */
export const getCaseList = (data: SearchRequest) => {
    return request.post<ResponseData<SearchResponse>>('/api/v1/home/medical-record-list', data);
};
