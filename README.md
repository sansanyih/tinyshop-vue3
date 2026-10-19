# 小蜂商城 · uni-app 重构版

把一个 **Vue2 + webpack** 的 uni-app 开源商城，重构成 **uni-app + Vue3 + TypeScript + Vite + Pinia** 的工程，并做到**不依赖后端也能完整跑通交易闭环**。

> 本项目基于 [stavyan/TinyShop-UniApp](https://github.com/stavyan/TinyShop-UniApp)（Apache-2.0）做架构级重构，
> 商品数据与图片为演示用 Mock 数据。原作者信息见 `THANKS.md`。

**在线演示**：https://sansanyih.github.io/tinyshop-vue3/ （手机浏览器打开，登录用任意手机号 + 验证码 `123456`）

![首页](docs/screenshots/home.png)

## 快速开始

```bash
npm install --legacy-peer-deps
npm run dev:h5          # http://127.0.0.1:5178
npm run build:h5        # H5 产物 -> dist/build/h5
npm run build:mp-weixin # 小程序产物 -> dist/build/mp-weixin（用微信开发者工具导入）
npm run type-check      # vue-tsc 类型检查
```

登录：任意 11 位手机号 + 验证码 **123456**（Mock 环境）。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 跨端框架 | uni-app 3（H5 / 微信小程序多端编译） |
| 视图 | Vue 3.5 组合式 API + `<script setup>` + TypeScript 5 |
| 构建 | Vite 5 + `@dcloudio/vite-plugin-uni` |
| 状态 | Pinia（user / cart / app 三个 store） |
| 样式 | SCSS + rpx + CSS 变量（设计 token 集中在 `src/uni.scss`） |
| 数据 | 本地 Mock 层（按 url 拦截）+ 真实后端双通道 |
| 质量 | vue-tsc 严格类型检查、CDP 截图回归脚本、GitHub Actions |

## 重构内容

| 维度 | 重构前（原项目） | 重构后 |
| --- | --- | --- |
| 框架 | Vue 2 选项式 + mixin | Vue 3 组合式 + `<script setup>` |
| 语言 | 纯 JS | TypeScript（`vue-tsc` 零错误） |
| 构建 | vue-cli 4 + webpack 4 + node-sass | Vite 5（构建 15.8s，HMR 秒级） |
| 状态 | Vuex | Pinia（含持久化） |
| 请求 | 自研 flyio 封装 | `uni.request` + 类型化拦截器 + Mock 双通道 |
| 分包 | 无 | order / account 两个子包 + preloadRule |
| 页面 | 53 个页面平铺 | 核心 10 页闭环（按业务域分层，其余按需追加） |

## 关键实现

### 1. 请求层（`src/utils/request.ts`）

- 请求拦截：注入 `x-api-key`（登录态）
- 响应拦截：统一解包 `{ code, message, data }`，业务码非 200 统一提示
- **401 兜底**：清登录态 → 带 `redirect` 参数跳登录页 → 登录后原路返回
- **loading 引用计数**：并发请求不会互相关掉 loading
- **Mock 开关**：未配置 `VITE_API_BASE` 时走本地 Mock，配置后自动走真实接口，业务代码零改动

### 2. Mock 层（`src/mock/`）

按 `METHOD + url` 匹配 handler，模拟 120–300ms 网络延迟，覆盖商品列表/详情、登录、地址、下单、支付；
接口路径与真实后端保持一致的 `/tiny-shop/v1/...` 结构，切换真后端只需设一个环境变量：

```bash
VITE_API_BASE=http://127.0.0.1:8080 npm run dev:h5
```

### 3. 分包

```jsonc
"subPackages": [
  { "root": "pages/order",   "pages": ["create", "list"] },
  { "root": "pages/account", "pages": ["login", "address"] }
],
"preloadRule": {
  "pages/cart/cart": { "packages": ["order"] },
  "pages/user/profile": { "packages": ["account"] }
}
```

### 4. 通用组件（`src/components/`）

- `RfNavbar`：自定义导航栏，适配状态栏与小程序胶囊
- `RfProductCard`：`grid`（双列瀑布流）/ `row`（列表行）双布局
- `RfSkeleton`：骨架屏，首屏不白屏、不跳动
- `RfNumberBox`：数量步进器（受控 + 边界收敛）
- `RfEmpty` / `RfLoadMore`：空态与加载态

## 页面一览

| 页面 | 说明 |
| --- | --- |
| 首页 | Banner + 分类入口 + 公告轮播 + 双列瀑布流 + 下拉刷新 + 触底加载 |
| 分类 | 左侧一级分类 + 右侧二级分类与商品列表（`scroll-view` 双栏） |
| 商品详情 | 轮播、价格区、SKU 弹层、加入购物车 / 立即购买 |
| 购物车 | 勾选、改数量、删除、合计、结算（`--window-bottom` 避让 tabbar） |
| 搜索 | 关键词检索 + 历史记录 |
| 我的 | 登录态、积分/余额/优惠券、订单入口、菜单 |
| 登录 | 手机号 + 验证码，登录后按 `redirect` 回跳（tabBar 自动走 switchTab） |
| 确认订单 | 地址选择、商品清单、优惠券、备注、提交并模拟支付 |
| 订单列表 | 状态 tab 筛选、空态 |
| 收货地址 | 列表选择 + 新增表单 |

## 指标

| 指标 | 数值 |
| --- | --- |
| 源码规模 | 33 个文件 / 4480 行（Vue + TS + SCSS） |
| 页面 / 组件 | 10 页 / 6 个通用组件 |
| `build:h5` | 15.8s，产物 0.82MB（含全部图片） |
| 首屏 JS | 259KB（gzip 94KB） |
| 首屏 CSS | 13KB（gzip 3.3KB） |
| 小程序体积 | 主包 629KB / order 分包 13.4KB / account 分包 11KB（2MB 限额内） |
| 类型检查 | `vue-tsc` 0 error |
| 图片资源 | 15 张全本地化（8–27KB/张），不依赖外网 CDN |

## 目录结构

```
src/
├─ api/           # 接口定义（url 常量 + 类型化方法）
├─ components/    # 通用组件 Rf*
├─ mock/          # Mock 数据与路由表
├─ pages/         # 页面（order / account 为分包）
├─ static/        # 本地图片资源
├─ stores/        # Pinia：user / cart / app
├─ types/         # 业务模型与响应类型
├─ utils/         # request / storage / format
├─ App.vue
├─ main.ts
├─ pages.json     # 路由 + tabBar + 分包配置
└─ manifest.json
scripts/
├─ shot.mjs       # 单页截图（CDP 设备模拟）
└─ shots-all.mjs  # 批量截图 → docs/screenshots
```

## 部署

**Vercel**：仓库根目录含 `vercel.json`，导入后一键部署（构建命令 `npm run build:h5`）。

**GitHub Pages**：`.github/workflows/deploy-h5.yml` 已配置，推送到 `main` 后自动构建并发布。
注意 `src/manifest.json` 里 H5 路由使用 `hash` 模式 + `base: "./"`，静态托管无需额外配置。

## 已知限制

- 目前只迁移了核心 10 页，原项目其余页面（评价、优惠券、发票等）未迁移
- 支付为 Mock 模拟，未接入真实支付
- 短信验证码为演示码 `123456`
- Vite 5.2 与 dart-sass 的 legacy API 有弃用警告（不影响构建）

## 许可证

重构代码基于 Apache-2.0 原项目衍生，遵循 Apache-2.0。演示商品图片来自公开数据集，仅用于演示。
