import type { PageResult } from '@/types/api'
import type { Banner, Category, Notice, Product } from '@/types/model'
import { http } from '@/utils/request'

/** 接口地址集中管理，与后端路由一一对应，便于联调时切换 */
export const URL = {
  bannerList: '/tiny-shop/v1/common/adv/index',
  noticeList: '/tiny-shop/v1/common/notify-announce/index',
  categoryList: '/tiny-shop/v1/product/category/index',
  productList: '/tiny-shop/v1/product/index',
  productView: '/tiny-shop/v1/product/view'
} as const

export interface ProductQuery {
  category_id?: number
  keyword?: string
  page?: number
  page_size?: number
}

export const getBanners = () => http.get<{ list: Banner[] }>(URL.bannerList).then((res) => res.list)

export const getNotices = () => http.get<{ list: Notice[] }>(URL.noticeList).then((res) => res.list)

export const getCategories = () => http.get<{ list: Category[] }>(URL.categoryList).then((res) => res.list)

export const getProducts = (query: ProductQuery = {}) =>
  http.get<PageResult<Product>>(URL.productList, query as Record<string, unknown>)

export const getProductDetail = (id: number) => http.get<Product>(URL.productView, { id })
