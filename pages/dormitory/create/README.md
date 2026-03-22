# 宿舍创建页面 - 开发文档

## 📁 文件结构

```
pages/dormitory/create/
├── index.wxml    # 页面结构（Vant Weapp 表单组件）
├── index.wxss    # 样式（温暖治愈系配色）
├── index.js      # 逻辑（表单验证 + 云数据库）
└── index.json    # 配置（Vant 组件引用）

cloudfunctions/
└── getOpenId/
    ├── index.js      # 获取用户 OpenId 云函数
    └── package.json  # 依赖配置

utils/
└── contentFilter.js  # 内容过滤工具
```

## ✅ 功能特性

### 1. 表单字段
- ✅ 宿舍名称输入框（必填，最多 20 字）
- ✅ 宿舍风格选择（温馨/可爱/简约）
- ✅ 宿舍人数选择（4/6/8 人）
- ✅ 年龄段选择（12-18/18-25/25-35/35-45）
- ✅ 宿舍介绍（选填，最多 200 字）
- ✅ 创建按钮（带加载状态）

### 2. 表单验证
- ✅ 必填项验证（Vant Form 内置）
- ✅ 内容过滤检查（敏感词检测）
- ✅ 名称长度验证（至少 2 字）
- ✅ 防止重复提交

### 3. 数据提交
- ✅ 使用微信云开发
- ✅ 写入 `dormitory` 集合
- ✅ 自动记录创建者 OpenId
- ✅ 自动记录创建时间

### 4. 交互体验
- ✅ 创建成功提示
- ✅ 自动跳转宿舍首页
- ✅ 失败错误提示
- ✅ 加载状态显示

## 🎨 设计风格

### 配色方案
- 主色调：`#FF6B81`（温暖粉色）
- 背景渐变：`#FFF5F6` → `#FFE4E8`
- 按钮渐变：`#FF6B81` → `#FF8FA3`
- 文字颜色：`#333`（主）/`#666`（次）/`#999`（辅助）

### 设计特点
- 圆角卡片设计（24rpx）
- 柔和阴影效果
- 全年龄段友好字体大小（30rpx+）
- 温暖治愈系视觉风格

## 🔧 技术实现

### Vant Weapp 组件
```json
{
  "van-form": "@vant/weapp/form/index",
  "van-field": "@vant/weapp/field/index",
  "van-button": "@vant/weapp/button/index",
  "van-popup": "@vant/weapp/popup/index",
  "van-picker": "@vant/weapp/picker/index"
}
```

### 云数据库结构
```javascript
{
  _id: "自动生成",
  name: "宿舍名称",
  style: "温馨/可爱/简约",
  memberCount: 4/6/8,
  ageRange: "12-18/18-25/25-35/35-45",
  introduction: "宿舍介绍",
  creatorId: "创建者 OpenId",
  createdAt: 时间戳，
  updatedAt: 时间戳，
  status: "active",
  maxMembers: 最大人数
}
```

## 📝 使用说明

### 1. 初始化云开发
在 `app.js` 中确保已初始化云开发：
```javascript
wx.cloud.init({
  env: 'your-env-id',
  traceUser: true
});
```

### 2. 上传云函数
在微信开发者工具中：
1. 右键 `cloudfunctions/getOpenId` 目录
2. 选择"上传并部署：云端安装依赖"

### 3. 创建数据库
在微信开发者工具云开发控制台：
1. 创建数据库集合 `dormitory`
2. 设置权限为"所有用户可读写"

### 4. 安装 Vant Weapp
确保已安装 Vant Weapp：
```bash
npm install @vant/weapp -S --production
```

在微信开发者工具中：
1. 工具 → 构建 npm
2. 勾选"将 JS 编译成 ES5"

## 🐛 常见问题

### Q1: Vant 组件不显示
- 检查 `app.json` 中是否配置 `usingComponents`
- 确认已执行"构建 npm"
- 检查基础库版本 ≥ 2.6.5

### Q2: 云函数调用失败
- 检查云开发环境是否初始化
- 确认云函数已上传并部署
- 查看云函数日志排查错误

### Q3: 数据库写入失败
- 检查数据库权限设置
- 确认集合名称正确（`dormitory`）
- 查看云开发控制台错误日志

## 📅 开发日志

- **2026-03-15 19:33** - 完成页面开发
  - 使用 Vant Weapp 表单组件重构
  - 实现云数据库写入
  - 添加内容过滤验证
  - 优化温暖治愈系样式

## 👤 开发者

- **Author:** 玄枢
- **Project:** 瓜瓜陪伴微信小程序
- **Version:** 1.0.0
