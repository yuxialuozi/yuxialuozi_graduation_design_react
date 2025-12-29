# 租户信息管理系统 - Claude Code 项目配置

## 项目概述

这是一个基于 React + TypeScript + Ant Design 的租户信息管理系统前端项目，用于毕业设计。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Ant Design 5
- **路由**: React Router 6
- **状态管理**: Zustand
- **HTTP 请求**: Axios
- **图表**: ECharts + echarts-for-react
- **CSS 预处理器**: Less

## 项目结构

```
src/
├── api/                    # API 接口定义
├── assets/                 # 静态资源
│   └── styles/            # 全局样式
├── components/            # 通用组件
├── hooks/                 # 自定义 Hooks
├── layouts/               # 布局组件
│   ├── components/        # 布局子组件 (Header, Sidebar, Footer)
│   └── MainLayout/        # 主布局
├── pages/                 # 页面组件
│   ├── Login/            # 登录页
│   ├── Dashboard/        # 仪表盘
│   ├── Tenant/           # 租户管理
│   ├── Contract/         # 合同管理
│   ├── Room/             # 房间管理
│   ├── Fee/              # 费用管理
│   ├── Maintenance/      # 维修管理
│   └── Report/           # 报表统计
├── router/               # 路由配置
├── store/                # Zustand 状态管理
├── types/                # TypeScript 类型定义
├── utils/                # 工具函数
└── main.tsx              # 应用入口
```

## 开发命令

```bash
npm run dev      # 启动开发服务器 (端口 3000)
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
npm run lint     # ESLint 检查
npm run format   # Prettier 格式化
```

## 代码规范

- 使用函数式组件 + Hooks
- 组件文件使用 PascalCase 命名
- 每个页面/组件使用独立目录，包含 index.tsx 和 index.less
- 使用 `@/` 作为 src 目录的路径别名
- TypeScript 严格模式

## API 代理配置

开发环境 API 请求代理到 `http://localhost:8080`，前缀 `/api` 会被自动去除。

## 功能模块

1. **登录认证**: 用户登录、token 管理
2. **仪表盘**: 数据概览、ECharts 图表
3. **租户管理**: CRUD 操作
4. **合同管理**: 合同全生命周期管理
5. **房间管理**: 房源信息管理
6. **费用管理**: 租金、水电费等
7. **维修管理**: 报修工单处理
8. **报表统计**: 多维度数据分析
