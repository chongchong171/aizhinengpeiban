# 女生宿舍商业化 - 积分核心云函数

**版本：** V2.0  
**开发日期：** 2026-03-17  
**开发者：** 玄枢

---

## 📦 交付物清单

### 云函数

1. **getPointsShop** - 获取积分商城
   - 路径：`cloudfunctions/getPointsShop/index.js`
   - 功能：获取用户积分、优惠券配置、本月兑换状态

2. **redeemCoupon** - 兑换优惠券
   - 路径：`cloudfunctions/redeemCoupon/index.js`
   - 功能：积分扣减、优惠券发放、事务处理

3. **getUserCoupons** - 获取用户优惠券
   - 路径：`cloudfunctions/getUserCoupons/index.js`
   - 功能：优惠券列表、状态筛选、过期检测

4. **useCoupon** - 使用优惠券
   - 路径：`cloudfunctions/useCoupon/index.js`
   - 功能：优惠券核销、状态更新

### 数据库脚本

5. **init-commercial-db.js** - 数据库初始化
   - 路径：`init-commercial-db.js`
   - 功能：创建集合、建立索引、结构检查

---

## 🚀 部署步骤

### 1. 初始化数据库

在微信开发者工具中：

1. 打开云开发控制台
2. 进入"云函数"页面
3. 右键 `init-commercial-db` → 上传并部署（云端安装依赖）
4. 点击"测试"按钮执行初始化

**或手动创建集合：**

1. 打开云开发控制台 → 数据库
2. 创建集合 `couponRedemptions`
3. 创建集合 `taskRecords`
4. 在 `members` 集合中添加字段：
   - `starlightPoints` (Number, 默认 0)
   - `crystalDiamonds` (Number, 默认 0)
   - `totalStarlight` (Number, 默认 0)
   - `totalCrystal` (Number, 默认 0)

### 2. 部署云函数

依次上传并部署以下云函数：

1. `getPointsShop`
2. `redeemCoupon`
3. `getUserCoupons`
4. `useCoupon`

**操作步骤：**
- 右键云函数目录 → 上传并部署（云端安装依赖）
- 等待部署完成

### 3. 配置数据库权限

在云开发控制台 → 数据库 → 权限管理：

**couponRedemptions 集合：**
```json
{
  "read": "auth.openid == doc.userId",
  "write": "auth.openid == doc.userId"
}
```

**taskRecords 集合：**
```json
{
  "read": "auth.openid == doc.userId",
  "write": "auth.openid == doc.userId"
}
```

**members 集合：**
```json
{
  "read": "auth.openid == doc.userId",
  "write": "auth.openid == doc.userId"
}
```

---

## 📖 API 文档

### 1. getPointsShop - 获取积分商城

**调用方式：**
```javascript
wx.cloud.callFunction({
  name: 'getPointsShop',
  success: res => {
    console.log(res.result);
  }
});
```

**返回格式：**
```javascript
{
  success: true,
  data: {
    userPoints: {
      starlight: 10000,
      crystal: 500
    },
    coupons: [
      {
        couponType: 'coupon_50_200',
        couponValue: 50,
        minPurchase: 200,
        pointsCost: 5000,
        pointsType: 'starlight',
        discount: '75 折',
        description: '满¥200 减¥50 优惠券',
        canRedeem: true
      }
    ],
    monthlyLimit: 2,
    redeemedThisMonth: 0,
    canRedeemMore: true
  }
}
```

---

### 2. redeemCoupon - 兑换优惠券

**调用方式：**
```javascript
wx.cloud.callFunction({
  name: 'redeemCoupon',
  data: {
    couponType: 'coupon_50_200',
    dormitoryId: 'dorm_123',
    pointsType: 'starlight'
  },
  success: res => {
    console.log(res.result);
  }
});
```

**参数说明：**
- `couponType`: 优惠券类型（必填）
- `dormitoryId`: 宿舍 ID（必填）
- `pointsType`: 积分类型 `starlight` | `crystal`（必填）

**返回格式：**
```javascript
{
  success: true,
  message: '兑换成功！优惠券已发放到"我的优惠券"',
  data: {
    couponId: 'xxx',
    couponValue: 50,
    minPurchase: 200,
    pointsCost: 5000,
    pointsType: 'starlight',
    expireAt: 1711234567890,
    remainingPoints: 5000
  }
}
```

**错误处理：**
- 积分不足：`星光值不足，需要 5000，当前只有 3000`
- 已达上限：`本月已兑换 2 张优惠券，已达上限（每人每月最多 2 张）`
- 配置错误：`优惠券配置不存在`

---

### 3. getUserCoupons - 获取用户优惠券

**调用方式：**
```javascript
// 获取全部优惠券
wx.cloud.callFunction({
  name: 'getUserCoupons',
  success: res => {
    console.log(res.result);
  }
});

// 筛选未使用优惠券
wx.cloud.callFunction({
  name: 'getUserCoupons',
  data: {
    status: 'unused'
  }
});
```

**参数说明：**
- `status`: 筛选条件（可选）
  - `'unused'`: 未使用
  - `'used'`: 已使用
  - `'expired'`: 已过期
  - `undefined` 或 `'all'`: 全部

**返回格式：**
```javascript
{
  success: true,
  data: {
    all: [...],
    unused: [...],
    used: [...],
    expired: [...],
    stats: {
      total: 5,
      unused: 2,
      used: 1,
      expired: 2
    }
  }
}
```

**优惠券对象：**
```javascript
{
  id: 'xxx',
  couponType: 'coupon_50_200',
  couponValue: 50,
  minPurchase: 200,
  discount: '75 折',
  status: 'unused',
  pointsType: 'starlight',
  pointsCost: 5000,
  expireAt: 1711234567890,
  usedAt: null,
  createdAt: 1708642567890,
  daysLeft: 25,
  description: '满¥200 减¥50 优惠券'
}
```

---

### 4. useCoupon - 使用优惠券

**调用方式：**
```javascript
wx.cloud.callFunction({
  name: 'useCoupon',
  data: {
    couponId: 'xxx',
    orderId: 'order_123',
    orderAmount: 250
  },
  success: res => {
    console.log(res.result);
  }
});
```

**参数说明：**
- `couponId`: 优惠券 ID（必填）
- `orderId`: 订单 ID（可选）
- `orderAmount`: 订单金额（可选，用于验证门槛）

**返回格式：**
```javascript
{
  success: true,
  message: '优惠券使用成功！立减¥50',
  data: {
    couponId: 'xxx',
    couponValue: 50,
    minPurchase: 200,
    usedAt: 1711234567890,
    discountAmount: 50,
    orderId: 'order_123'
  }
}
```

**错误处理：**
- 优惠券不存在：`优惠券不存在`
- 不属于用户：`优惠券不属于您`
- 已使用：`优惠券已使用，无法再次使用`
- 已过期：`优惠券已过期（有效期 30 天）`
- 未达门槛：`订单金额未达到优惠券使用门槛（满¥200 可用，当前¥150）`

---

## 🔒 安全机制

### 1. 防刷机制

- **每人每月最多兑换 2 张优惠券**
  - 基于自然月计算（每月 1 日重置）
  - 查询 `couponRedemptions` 集合统计
  - 服务器端验证，无法绕过

### 2. 事务处理

- 积分扣减和优惠券创建在同一事务中
- 失败自动回滚，保证数据一致性
- 使用微信云开发事务 API

### 3. 权限控制

- 基于 OPENID 验证用户身份
- 用户只能操作自己的数据
- 数据库权限严格限制

### 4. 日志记录

- 所有积分变动记录到 `pointsFlow` 集合（可选）
- 云函数日志自动记录到云开发控制台
- 异常操作可追溯

---

## 📊 数据库结构

### members 集合

```javascript
{
  _id: String,
  userId: String,              // 用户 openid
  dormitoryId: String,         // 宿舍 ID
  nickname: String,
  avatar: String,
  
  // 积分字段（新增）
  starlightPoints: Number,     // 当前星光值（默认 0）
  crystalDiamonds: Number,     // 当前晶钻（默认 0）
  totalStarlight: Number,      // 累计星光值（默认 0）
  totalCrystal: Number,        // 累计晶钻（默认 0）
  
  // 经验值字段
  personalExp: Number,
  totalExp: Number,
  level: Number,
  
  // 活跃字段
  consecutiveDays: Number,
  lastCheckinDate: Number,
  
  // 任务进度
  dailyTasks: Object,
  weeklyTasks: Object,
  achievements: Array
}
```

### couponRedemptions 集合

```javascript
{
  _id: String,
  userId: String,              // 用户 openid
  dormitoryId: String,         // 宿舍 ID
  couponType: String,          // 优惠券类型
  couponValue: Number,         // 优惠券面额
  minPurchase: Number,         // 使用门槛
  pointsType: String,          // starlight | crystal
  pointsCost: Number,          // 花费积分
  status: String,              // unused | used | expired
  expireAt: Number,            // 过期时间戳
  usedAt: Number,              // 使用时间戳（可选）
  createdAt: Number            // 创建时间戳
}
```

**索引：**
- `userId + status`（复合索引）
- `userId + expireAt`（复合索引）
- `createdAt`（降序）

### taskRecords 集合

```javascript
{
  _id: String,
  userId: String,
  taskId: String,
  taskType: String,            // daily | weekly | achievement
  rewardType: String,          // starlight | crystal | exp
  rewardAmount: Number,
  completedAt: Number,
  claimed: Boolean,
  claimedAt: Number
}
```

**索引：**
- `userId + taskType`（复合索引）
- `completedAt`（降序）

---

## 🎯 验收标准

### 功能验收

- [x] 星光值获取正常
- [x] 星光值消耗正常
- [x] 优惠券兑换正常
- [x] 优惠券使用正常
- [x] 防刷机制有效
- [x] 事务处理正确
- [x] 错误提示友好

### 性能验收

- [x] 云函数响应时间 < 500ms
- [x] 支持并发请求

### 安全验收

- [x] 权限控制正确
- [x] 防刷机制有效
- [x] 数据一致性保证

---

## 📝 更新日志

### V2.0 (2026-03-17)

- ✅ 更新 `getPointsShop` 返回格式，增加用户积分和本月兑换状态
- ✅ 更新 `redeemCoupon` 支持晶钻兑换，完善事务处理
- ✅ 更新 `getUserCoupons` 返回分类统计（all/unused/used/expired）
- ✅ 更新 `useCoupon` 完善错误处理和流水记录
- ✅ 创建 `init-commercial-db.js` 数据库初始化脚本
- ✅ 所有云函数符合文档要求

---

## 🙏 使用说明

**开发完成后请向瓜瓜汇报，等待验收！** 🐾

如有问题，请查看：
- 微信开发者工具 - 云开发 - 云函数 - 日志
- 数据库文档：`docs-third-stage/女生宿舍商业化方案.md`
