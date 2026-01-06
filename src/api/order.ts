import request from '@/utils/request';
import type { ResponseData } from '@/utils/request';

/**
 * 创建订单请求参数
 */
export interface CreateOrderParams {
  /** 课程ID */
  course_id: number;
  /** 支付方式 */
  payment_method: string;
  /** 是否使用麦粒抵扣 */
  use_grain: boolean;
  /** 支付金额 */
  amount: number;
}

/**
 * 创建订单
 * @param data 订单参数
 * @param idempotencyKey 幂等性Key
 */
export const createOrder = (data: CreateOrderParams, idempotencyKey: string) => {
  return request.post<ResponseData<any>>('/api/v1/order/create', data, {
    headers: {
      'Idempotency-Key': idempotencyKey
    }
  });
};
