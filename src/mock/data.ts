import type { Address, Banner, Category, Notice, Order, Product, Sku } from '@/types/model'

/** 商品图：本地静态资源，白色背景产品照，避免依赖外网 CDN */
const img = (n: number) => `/static/goods/g${String(n).padStart(2, '0')}.jpg`

export const banners: Banner[] = [
  {
    id: 1,
    image: '/static/banner/b1.png',
    link: '/pages/product/detail?id=5',
    title: '开学季 · 数码焕新',
    subtitle: '轻薄本 / 耳机 最高直降 700'
  },
  {
    id: 2,
    image: '/static/banner/b2.png',
    link: '/pages/product/detail?id=1',
    title: '降噪耳机 · 限时秒杀',
    subtitle: '主动降噪 40dB 到手价 ¥1299'
  },
  {
    id: 3,
    image: '/static/banner/b3.png',
    link: '/pages/product/detail?id=6',
    title: '香氛季 · 木质调上新',
    subtitle: '满 399 减 50，会员再享 9 折'
  }
]

export const categories: Category[] = [
  {
    id: 1,
    name: '数码电器',
    icon: '📱',
    children: [
      { id: 101, name: '耳机音箱' },
      { id: 102, name: '腕表穿戴' },
      { id: 103, name: '电脑办公' }
    ]
  },
  {
    id: 2,
    name: '家居生活',
    icon: '🛋️',
    children: [
      { id: 201, name: '家具家纺' },
      { id: 202, name: '杯壶餐具' },
      { id: 203, name: '绿植装饰' },
      { id: 204, name: '厨房小电' }
    ]
  },
  {
    id: 3,
    name: '服饰鞋包',
    icon: '👕',
    children: [{ id: 301, name: '运动速干' }]
  },
  {
    id: 4,
    name: '美妆个护',
    icon: '💄',
    children: [
      { id: 401, name: '香氛香薰' },
      { id: 402, name: '身体护理' }
    ]
  },
  {
    id: 5,
    name: '食品宠物',
    icon: '🐱',
    children: [{ id: 501, name: '宠物主粮' }]
  }
]

const buildSkus = (productId: number, price: number, marketPrice: number): Sku[] => [
  {
    id: productId * 10 + 1,
    productId,
    name: '标准版',
    price,
    marketPrice,
    stock: 120,
    attrs: [
      { name: '版本', value: '标准版' },
      { name: '颜色', value: '经典银' }
    ]
  },
  {
    id: productId * 10 + 2,
    productId,
    name: '升级版',
    price: Math.round(price * 1.15 * 100) / 100,
    marketPrice,
    stock: 46,
    attrs: [
      { name: '版本', value: '升级版' },
      { name: '颜色', value: '深空灰' }
    ]
  }
]

interface Seed {
  title: string
  subtitle: string
  price: number
  marketPrice: number
  sales: number
  categoryId: number
  tags: string[]
}

const seeds: Seed[] = [
  {
    title: '无线降噪头戴耳机',
    subtitle: '自适应主动降噪 / 40h 续航 / 空间音频',
    price: 1299,
    marketPrice: 1699,
    sales: 8621,
    categoryId: 101,
    tags: ['包邮', '7天无理由']
  },
  {
    title: '经典机械腕表 钢带款',
    subtitle: '蓝宝石镜面 / 50m 防水 / 自动上链机芯',
    price: 2899,
    marketPrice: 3699,
    sales: 1268,
    categoryId: 102,
    tags: ['顺丰', '正品保障']
  },
  {
    title: '便携真空随行杯 350ml',
    subtitle: '316 不锈钢内胆 / 12h 保温 / 一键开盖',
    price: 89,
    marketPrice: 139,
    sales: 12038,
    categoryId: 202,
    tags: ['热销', '包邮']
  },
  {
    title: '轻奢实木双人床 1.8m',
    subtitle: '北美白蜡木 / 环保水性漆 / 含床垫',
    price: 3699,
    marketPrice: 4899,
    sales: 386,
    categoryId: 201,
    tags: ['大件包邮', '送装一体']
  },
  {
    title: '14 英寸轻薄办公本',
    subtitle: 'M 系列芯片 / 16G+512G / 18h 续航',
    price: 8999,
    marketPrice: 9999,
    sales: 532,
    categoryId: 103,
    tags: ['教育优惠', '12期免息']
  },
  {
    title: '木质调淡香精 50ml',
    subtitle: '雪松前调 / 留香 8h / 中性香型',
    price: 599,
    marketPrice: 799,
    sales: 2874,
    categoryId: 401,
    tags: ['礼盒', '会员9折']
  },
  {
    title: '人体工学办公椅',
    subtitle: '4D 扶手 / 网背透气 / 三档腰托',
    price: 1299,
    marketPrice: 1799,
    sales: 1740,
    categoryId: 201,
    tags: ['新品', '五年质保']
  },
  {
    title: '速干运动 T 恤 男女同款',
    subtitle: '冰感面料 / 速干排汗 / 3D 立体剪裁',
    price: 129,
    marketPrice: 199,
    sales: 22014,
    categoryId: 301,
    tags: ['多色可选', '第二件半价']
  },
  {
    title: '天然烘焙猫粮 1.5kg',
    subtitle: '鲜肉配方 / 粗蛋白 42% / 无谷低敏',
    price: 169,
    marketPrice: 239,
    sales: 6640,
    categoryId: 501,
    tags: ['正品保障', '满2件包邮']
  },
  {
    title: '北欧陶瓷花盆 大号',
    subtitle: '哑光釉面 / 带排水托盘 / 附赠绿植',
    price: 69,
    marketPrice: 109,
    sales: 4218,
    categoryId: 203,
    tags: ['新品']
  },
  {
    title: '保湿身体乳 500ml',
    subtitle: '乳木果油 / 24h 长效保湿 / 无香精',
    price: 89,
    marketPrice: 129,
    sales: 9312,
    categoryId: 402,
    tags: ['回购榜']
  },
  {
    title: '破壁料理机 1.5L',
    subtitle: '1200W 大功率 / 8 档调速 / 一键清洗',
    price: 399,
    marketPrice: 599,
    sales: 2861,
    categoryId: 204,
    tags: ['爆款', '包邮']
  }
]

export const products: Product[] = seeds.map((seed, index) => {
  const id = index + 1
  return {
    id,
    title: seed.title,
    subtitle: seed.subtitle,
    cover: img(id),
    images: [img(id), img(((id + 4) % 12) + 1), img(((id + 7) % 12) + 1)],
    price: seed.price,
    marketPrice: seed.marketPrice,
    sales: seed.sales,
    stock: 168,
    categoryId: seed.categoryId,
    tags: seed.tags,
    skus: buildSkus(id, seed.price, seed.marketPrice),
    detail: `<p>${seed.subtitle}</p><p>发货地：广东深圳 · 48 小时内发货 · 支持 7 天无理由退换 · 全国联保</p><p>温馨提示：大件商品由官方物流直送，签收前请当面验收外包装。</p>`
  }
})

export const notices: Notice[] = [
  {
    id: 1,
    title: '关于春节期间物流时效的公告',
    content: '春节期间（1 月 20 日 - 2 月 5 日）下单，物流时效可能延长 1-3 天，敬请谅解。',
    createdAt: '2025-01-15 10:00'
  },
  {
    id: 2,
    title: '平台服务升级通知',
    content: '系统将于本周日凌晨 2:00-4:00 进行升级维护，期间下单与支付功能暂停。',
    createdAt: '2025-01-08 09:30'
  },
  {
    id: 3,
    title: '会员积分规则调整说明',
    content: '自 2025 年 1 月起，消费 1 元累计 1 积分，积分可在订单结算时抵扣现金。',
    createdAt: '2025-01-02 14:20'
  }
]

export const mockAddresses: Address[] = [
  {
    id: 1,
    name: '申思宇',
    mobile: '13662659069',
    region: '广东省 深圳市 南山区',
    detail: '科技园南路 8 号 A 座 1802',
    isDefault: true
  },
  {
    id: 2,
    name: '申同学',
    mobile: '13800001111',
    region: '广东省 惠州市 惠城区',
    detail: '演达大道 46 号 惠州学院 3 号宿舍楼',
    isDefault: false
  }
]

export const mockOrders: Order[] = []
