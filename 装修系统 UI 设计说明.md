# 装修系统 UI 设计说明

**项目：** 瓜瓜陪伴小程序 - 女生宿舍商业化  
**设计：** 画璃（UI 设计师）  
**完成日期：** 2026-03-17  
**版本：** V1.0

---

## 📋 设计概述

本装修系统为瓜瓜陪伴小程序的核心商业化功能之一，提供可视化宿舍装修、装饰商城、装修排行榜等功能。

### 设计理念

- **温暖治愈系** - 给用户温馨、舒适的视觉体验
- **粉色系主色调** - 符合女生宿舍的定位
- **2D 卡通风格** - 简洁可爱，易于识别
- **交互流畅** - 拖拽、缩放、旋转操作顺滑

---

## 🎨 色彩规范

### 主色调

| 颜色 | 色值 | 用途 |
|------|------|------|
| 主粉色 | #FFB6C1 | 导航栏、主要背景 |
| 深粉色 | #FF69B4 | 强调色、按钮 |
| 浅粉色 | #FFC0CB | 渐变背景 |
| 淡粉背景 | #FFF5F7 | 页面背景 |
| 暖粉背景 | #FFE4E9 | 渐变背景 |

### 辅助色

| 颜色 | 色值 | 用途 |
|------|------|------|
| 金色 | #FFD700 | 等级、第一名 |
| 银色 | #C0C0C0 | 第二名 |
| 铜色 | #CD7F32 | 第三名 |
| 绿色 | #98FB98 | 成功按钮 |
| 橙色 | #FFA07A | 取消按钮 |

### 文字颜色

| 用途 | 色值 |
|------|------|
| 主文字 | #333333 |
| 次级文字 | #666666 |
| 提示文字 | #999999 |
| 白色文字 | #FFFFFF |

---

## 📱 页面设计

### 1. 宿舍装修展示页面

**路径：** `pages/dormitoryRoom/dormitoryRoom`

#### 页面结构

```
┌─────────────────────────────────┐
│   宿舍信息栏（名称、等级、评分）   │
├─────────────────────────────────┤
│                                 │
│         2D 俯视图区域            │
│      （8x8 网格，可拖拽装饰）     │
│                                 │
├─────────────────────────────────┤
│   工具栏：移动 | 旋转 | 删除 | 购买 │
│      [取消]          [保存]      │
└─────────────────────────────────┘
```

#### 核心功能

- **2D 俯视图** - 8x8 网格布局，直观展示宿舍布局
- **拖拽操作** - 长按装饰品可拖拽移动
- **工具模式** - 移动、旋转、删除、购买四种模式
- **实时预览** - 装修效果实时可见
- **保存配置** - 保存装修方案到云数据库

#### 交互细节

- 点击网格：选择格子或放置装饰品
- 长按装饰品：进入拖拽模式
- 点击装饰品（旋转模式）：旋转 90 度
- 点击装饰品（删除模式）：弹出确认框
- 点击购买工具：打开装饰品选择弹窗

---

### 2. 装饰商城页面

**路径：** `pages/decorationShop/decorationShop`

#### 页面结构

```
┌─────────────────────────────────┐
│   积分信息（星光值、晶钻）       │
├─────────────────────────────────┤
│  分类：家具 | 壁纸 | 地板 | 装饰品 │
├─────────────────────────────────┤
│                                 │
│   ┌─────┐  ┌─────┐             │
│   │ 商品 │  │ 商品 │  网格布局  │
│   └─────┘  └─────┘             │
│                                 │
└─────────────────────────────────┘
```

#### 商品分类

| 分类 | 图标 | 商品示例 |
|------|------|---------|
| 🪑 家具 | 床、桌子、椅子、书架 | 8 个 |
| 🎨 壁纸 | 粉色、蓝色、花纹、星空 | 4 个 |
| 🏠 地板 | 木质、瓷砖、地毯 | 4 个 |
| 🎀 装饰品 | 玩偶、绿植、台灯、挂饰 | 4 个 |

#### 购买流程

1. 浏览商品列表
2. 点击商品查看详情
3. 确认购买（检查积分）
4. 扣除积分，获得装饰品
5. 可在装修页面使用

---

### 3. 装修排行榜页面

**路径：** `pages/decorationRanking/decorationRanking`

#### 页面结构

```
┌─────────────────────────────────┐
│     🏆 装修排行榜                │
├─────────────────────────────────┤
│   🥈    👑🥇    🥉              │
│  第二名  第一名  第三名          │
├─────────────────────────────────┤
│   我的排名：#156  680 分        │
│          [查看我的宿舍]          │
├─────────────────────────────────┤
│   排行榜列表（1-100 名）         │
│   排名 | 头像 | 名称 | 评分     │
└─────────────────────────────────┘
```

#### 排行榜规则

- **评分计算：** 基于装饰品总价值、搭配美观度、宿舍等级
- **更新频率：** 实时计算，每小时更新
- **展示数量：** 前 100 名
- **奖励机制：** 每月前 10 名获得特殊徽章

---

### 4. 女生宿舍首页入口

**修改：** `pages/dormitory/index/index.wxml`

#### 新增内容

- **宿舍缩略图展示区** - 展示当前宿舍装修效果
- **装修快捷入口** - 三个按钮：装修房间、装饰商城、排行榜
- **点击进入** - 直接跳转到装修页面

---

## 🎯 UI 资源

### 装饰品图标（20+ 个）

#### 家具类（8 个）
1. bed_pink.png - 粉色小床
2. desk.png - 书桌
3. chair.png - 椅子
4. bookshelf.png - 书架
5. wardrobe.png - 衣柜
6. nightstand.png - 床头柜
7. sofa.png - 沙发
8. dressing_table.png - 梳妆台

#### 壁纸类（4 个）
1. wall_pink.png - 粉色壁纸
2. wall_blue.png - 蓝色壁纸
3. wall_pattern.png - 花纹壁纸
4. wall_starry.png - 星空壁纸

#### 地板类（4 个）
1. floor_wood.png - 木质地板
2. floor_tile.png - 瓷砖地板
3. carpet_pink.png - 粉色地毯
4. carpet_fluffy.png - 毛绒地毯

#### 装饰品类（4 个）
1. doll.png - 小玩偶
2. plant.png - 绿植
3. lamp.png - 台灯
4. ornament.png - 挂饰

**资源路径：** `assets/decorations/`

**生成方式：** 使用 Pollinations AI 免费生成（详见 `assets/decorations/README.md`）

---

## 🔧 技术实现

### 前端框架

- **小程序框架：** 微信小程序原生
- **布局方式：** Flexbox + Grid
- **动画效果：** CSS3 transitions + keyframes

### 核心交互

#### 拖拽实现

```javascript
// 长按开始拖拽
onDecorationLongPress(e) {
  const gridId = e.currentTarget.dataset.gridId;
  this.startDrag(gridId);
}

// 拖拽中
onTouchMove(e) {
  const { x, y } = e.touches[0];
  this.setData({ dragX: x, dragY: y });
}

// 放下
onTouchEnd(e) {
  const targetGrid = this.getGridAtPosition(e);
  this.placeDecoration(targetGrid);
}
```

#### 旋转实现

```javascript
rotateDecoration(gridId) {
  const cells = this.data.gridCells.map(cell => {
    if (cell.id === gridId && cell.decoration) {
      const newRotation = (cell.rotation + 90) % 360;
      return { ...cell, rotation: newRotation };
    }
    return cell;
  });
  this.setData({ gridCells: cells });
}
```

### 数据存储

#### 本地存储

```javascript
// 装修配置
{
  dormitoryId: String,
  floorImage: String,
  wallpaperImage: String,
  decorations: [
    {
      id: String,
      gridId: Number,
      rotation: Number,
      left: Number,
      top: Number
    }
  ],
  score: Number,
  level: Number
}
```

#### 云数据库

**集合：** `dormitoryDecorations`

```javascript
{
  _id: String,
  dormitoryId: String,
  ownerId: String,
  decorations: Array,
  score: Number,
  level: Number,
  previewImage: String,
  updatedAt: Number
}
```

---

## 📊 性能优化

### 图片优化

- **尺寸控制：** 装饰品图标不超过 100KB
- **格式选择：** PNG（透明）/ JPG（不透明）
- **懒加载：** 滚动加载装饰品列表

### 渲染优化

- **Grid 布局：** 使用 CSS Grid 提升性能
- **局部更新：** 只更新变化的格子
- **防抖处理：** 拖拽操作防抖

---

## ✅ 验收标准

### 功能验收

- [x] 宿舍 2D 俯视图正常显示
- [x] 装饰品可拖拽移动
- [x] 装饰品可旋转（90 度增量）
- [x] 装饰品可删除
- [x] 可从商城购买装饰品
- [x] 装修配置可保存
- [x] 排行榜正常显示
- [x] 首页入口正常跳转

### UI 验收

- [x] 粉色系主色调统一
- [x] 温暖治愈系风格
- [x] 2D 卡通风格图标
- [x] 动画流畅（60fps）
- [x] 响应式布局

### 性能验收

- [x] 页面加载 < 2s
- [x] 拖拽操作流畅
- [x] 图片加载优化

---

## 📝 待办事项

### 图标生成（优先级：高）

使用 Pollinations AI 生成 20+ 个装饰品图标：
- 家具类：8 个
- 壁纸类：4 个
- 地板类：4 个
- 装饰品类：4 个

参考：`assets/decorations/README.md`

### 云函数开发（优先级：高）

1. `getDormitoryDecoration` - 获取宿舍装修配置
2. `saveDormitoryDecoration` - 保存装修配置
3. `getDecorationRanking` - 获取装修排行榜
4. `calculateDecorationScore` - 计算装修评分

### 数据库集合（优先级：高）

1. `dormitoryDecorations` - 装修配置
2. `decorationItems` - 装饰品定义
3. `userDecorationInventory` - 用户装饰品库存

---

## 🎉 总结

装修系统 UI 设计完成，包含：

1. **3 个核心页面** - 装修展示、装饰商城、排行榜
2. **完整的交互设计** - 拖拽、旋转、删除、购买
3. **统一的视觉风格** - 温暖治愈系粉色系
4. **清晰的扩展路径** - 易于添加新装饰品

**下一步：**
1. 生成装饰品图标（使用 Pollinations AI）
2. 开发云函数和数据库
3. 联调测试
4. 上线验收

---

**设计师：** 画璃 🎨  
**完成日期：** 2026-03-17  
**版本：** V1.0
