export interface Banner {
  id: number
  image: string
  link: string
  title: string
  subtitle?: string
}

export interface Category {
  id: number
  name: string
  icon?: string
  children?: Category[]
}

export interface SkuAttr {
  name: string
  value: string
}

export interface Sku {
  id: number
  productId: number
  name: string
  price: number
  marketPrice: number
  stock: number
  attrs: SkuAttr[]
}

export interface Product {
  id: number
  title: string
  subtitle: string
  cover: string
  images: string[]
  price: number
  marketPrice: number
  sales: number
  stock: number
  categoryId: number
  tags: string[]
  skus: Sku[]
  detail: string
}

export interface CartItem {
  productId: number
  skuId: number
  title: string
  cover: string
  price: number
  skuName: string
  qty: number
  checked: boolean
  stock: number
}

export interface Address {
  id: number
  name: string
  mobile: string
  region: string
  detail: string
  isDefault: boolean
}

export type OrderStatus = 'unpaid' | 'shipping' | 'receiving' | 'finished' | 'closed'

export interface OrderItem {
  productId: number
  skuId: number
  title: string
  cover: string
  price: number
  skuName: string
  qty: number
}

export interface Order {
  id: number
  orderNo: string
  status: OrderStatus
  items: OrderItem[]
  totalAmount: number
  payAmount: number
  address: Address
  createdAt: string
  remark?: string
}

export interface UserProfile {
  id: number
  nickname: string
  avatar: string
  mobile: string
  level: string
  points: number
  balance: number
  couponCount: number
}

export interface Notice {
  id: number
  title: string
  content: string
  createdAt: string
}

export interface LoginResult {
  token: string
  profile: UserProfile
}
