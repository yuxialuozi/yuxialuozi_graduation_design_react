# 租户信息管理系统

基于 React + TypeScript + Ant Design 的租户信息管理系统前端项目，用于毕业设计。

## 项目简介

本系统是一个面向物业管理/房屋租赁场景的信息化管理平台，旨在提供完整的租户管理、合同管理、费用管理等功能，帮助管理人员高效地进行日常运营管理。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | ^18.3.1 | 前端框架 |
| TypeScript | ^5.4.0 | 类型安全 |
| Vite | ^5.1.0 | 构建工具 |
| Ant Design | ^5.15.0 | UI 组件库 |
| React Router | ^6.22.0 | 路由管理 |
| Zustand | ^4.5.0 | 状态管理 |
| Axios | ^1.6.7 | HTTP 请求 |
| ECharts | ^5.5.0 | 数据可视化 |
| Less | ^4.2.0 | CSS 预处理器 |

## 功能模块

- **登录认证**: 用户登录、权限验证
- **仪表盘**: 数据概览、图表统计
- **租户管理**: 租户信息的增删改查
- **合同管理**: 租赁合同的全生命周期管理
- **房间管理**: 房源信息管理
- **费用管理**: 租金、水电费等费用管理
- **维修管理**: 报修工单处理
- **报表统计**: 多维度数据分析报表

## 快速开始

### 环境要求

- Node.js >= 20.x
- npm >= 10.x

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 目录结构

```
src/
├── api/                    # API 接口定义
├── assets/                 # 静态资源
│   ├── images/            # 图片资源
│   └── styles/            # 全局样式
├── components/            # 通用组件
│   └── common/            # 公共组件
├── hooks/                 # 自定义 Hooks
├── layouts/               # 布局组件
│   ├── components/        # 布局子组件
│   │   ├── Header/       # 顶部导航
│   │   ├── Sidebar/      # 侧边菜单
│   │   └── Footer/       # 页脚
│   └── MainLayout/       # 主布局
├── pages/                 # 页面组件
│   ├── Login/            # 登录页
│   ├── Dashboard/        # 仪表盘
│   ├── Tenant/           # 租户管理
│   └── Contract/         # 合同管理
├── router/               # 路由配置
├── store/                # 状态管理
├── types/                # TypeScript 类型定义
├── utils/                # 工具函数
└── main.tsx              # 应用入口
```

## 开发规范

### 代码风格

- 使用 ESLint + Prettier 进行代码格式化
- 遵循 React Hooks 最佳实践
- 组件使用函数式组件 + Hooks

### 命名规范

- 组件文件：PascalCase（如 `UserList.tsx`）
- 工具函数：camelCase（如 `formatDate.ts`）
- 样式文件：与组件同名（如 `index.less`）
- 常量：UPPER_SNAKE_CASE

### 目录规范

- 每个页面/组件使用独立目录
- 目录内包含 `index.tsx` 和 `index.less`
- 相关子组件放在 `components` 子目录

## 配置说明

### 代理配置

开发环境 API 代理配置在 `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

### 路径别名

使用 `@` 作为 `src` 目录的别名:

```typescript
import { useUserStore } from '@/store'
```

## License

MIT
