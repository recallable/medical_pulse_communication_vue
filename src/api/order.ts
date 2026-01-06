import request from '@/utils/request';
import type { ResponseData } from '@/utils/request';

/**
 * 支付方式枚举
 */
export enum PaymentMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  GRAIN = 'grain',
  FREE = 'free'
}

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

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
 * 创建订单响应数据
 */
export interface CreateOrderResponse {
  user_id: string;
  order_id: string;
  status: OrderStatus;
  course_id: number;
  amount: number;
  payment_info: {
    is_instant_success: boolean;
    status: OrderStatus;
    payment_url: string;
    message: string;
  };
}

/**
 * 订单状态响应数据
 */
export interface OrderStatusResponse {
  order_id: string;
  status: OrderStatus;
}

/**
 * 创建订单
 * @param data 订单参数
 * @param idempotencyKey 幂等性Key
 */
export const createOrder = (data: CreateOrderParams, idempotencyKey: string) => {
  return request.post<ResponseData<CreateOrderResponse>>('/api/v1/order/create', data, {
    headers: {
      'Idempotency-Key': idempotencyKey
    }
  });
};

/**
 * 查询订单状态
 * @param orderId 订单ID
 */
export const getOrderStatus = (orderId: string) => {
  return request.get<ResponseData<OrderStatusResponse>>(`/api/v1/order/${orderId}`);
};
