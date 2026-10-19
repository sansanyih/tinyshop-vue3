import type { Address, LoginResult, Order, OrderItem, UserProfile } from '@/types/model'
import { http } from '@/utils/request'

export const URL = {
  login: '/tiny-shop/v1/user/login',
  userInfo: '/tiny-shop/v1/user/info',
  addressList: '/tiny-shop/v1/member/address/index',
  addressCreate: '/tiny-shop/v1/member/address/create',
  orderList: '/tiny-shop/v1/order/index',
  orderCreate: '/tiny-shop/v1/order/create',
  orderPay: '/tiny-shop/v1/order/pay'
} as const

export const login = (mobile: string, code: string) =>
  http.post<LoginResult>(URL.login, { mobile, code })

export const getUserInfo = () => http.get<UserProfile>(URL.userInfo, undefined, { auth: true })

export const getAddressList = () =>
  http.get<{ list: Address[] }>(URL.addressList, undefined, { auth: true }).then((res) => res.list)

export const createAddress = (payload: Omit<Address, 'id' | 'isDefault'>) =>
  http.post<Address>(URL.addressCreate, payload as unknown as Record<string, unknown>, { auth: true })

export interface OrderQuery {
  status?: string
  page?: number
  page_size?: number
}

export const getOrders = (query: OrderQuery = {}) =>
  http.get<{ list: Order[]; total: number; page: number; pageSize: number }>(
    URL.orderList,
    query as Record<string, unknown>,
    { auth: true, showError: false }
  )

export interface CreateOrderPayload {
  items: OrderItem[]
  remark?: string
}

export const createOrder = (payload: CreateOrderPayload) =>
  http.post<Order>(URL.orderCreate, payload as unknown as Record<string, unknown>, { auth: true })

export const payOrder = (id: number) => http.post<Order>(URL.orderPay, { id }, { auth: true })
