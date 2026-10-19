/** 统一响应结构，与后端 Result 保持一致 */
export interface ApiResult<T> {
  code: number
  message: string
  data: T
}

/** 分页结构 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 分页请求参数 */
export interface PageQuery {
  page?: number
  pageSize?: number
}
