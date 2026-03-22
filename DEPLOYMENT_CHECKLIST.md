# 女生宿舍商业化 - 云函数部署检查清单

**日期：** 2026-03-17  
**开发者：** 玄枢  
**验收人：** 瓜瓜 🐾

---

## ✅ 交付物清单

### 1. 云函数文件

- [x] `cloudfunctions/getPointsShop/index.js` - 获取积分商城
- [x] `cloudfunctions/getPointsShop/package.json`
- [x] `cloudfunctions/redeemCoupon/index.js` - 兑换优惠券
- [x] `cloudfunctions/redeemCoupon/package.json`
- [x] `cloudfunctions/getUserCoupons/index.js` - 获取用户优惠券
- [x] `cloudfunctions/getUserCoupons/package.json`
- [x] `cloudfunctions/useCoupon/index.js` - 使用优惠券
- [x] `cloudfunctions/useCoupon/package.json`

### 2. 数据库脚本

- [x] `init-commercial-db.js` - 数据库初始化脚本

### 3. 文档

- [x] `cloudfunctions/README.md` - 云函数使用说明

---

## 📋 部署步骤

### 第一步：初始化数据库

**方式一：使用初始化脚本（推荐）**

1. 在微信开发者工具中，将 `init-commercial-db.js` 放入 `cloudfunctions/` 目录
2. 右键 `init-commercial-db` → 上传并部署（云端安装依赖）
3. 点击"测试"按钮执行初始化
4. 查看日志确认执行成功

**方式二：手动创建集合**

1. 打开云开发控制台 → 数据库
2. 点击"添加集合"
3. 创建 `couponRedemptions` 集合
4. 创建 `taskRecords` 集合
5. 在 `members` 集合中添加以下字段（Number 类型，默认值 0）：
   - `starlightPoints`
   - `crystalDiamonds`
   - `totalStarlight`
   - `totalCrystal`

### 第二步：配置数据库索引

在云开发控制台 → 数据库 → 选择集合 → 索引管理：

**couponRedemptions 集合：**
- [ ] 添加复合索引：`userId` (升序) + `status` (升序)
- [ ] 添加复合索引：`userId` (升序) + `expireAt` (升序)
- [ ] 添加索引：`createdAt` (降序)

**taskRecords 集合：**
- [ ] 添加复合索引：`userId` (升序) + `taskType` (升序)
- [ ] 添加索引：`completedAt` (降序)

### 第三步：配置数据库权限

在云开发控制台 → 数据库 → 选择集合 → 权限管理：

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

### 第四步：上传云函数

依次右键以下云函数 → 上传并部署（云端安装依赖）：

- [ ] `getPointsShop`
- [ ] `redeemCoupon`
- [ ] `getUserCoupons`
- [ ] `useCoupon`

**等待部署完成提示！**

### 第五步：测试云函数

在云开发控制台 → 云函数 → 选择函数 → 测试：

#### 测试 getPointsShop

**测试参数：**
```json
{}
```

**预期结果：**
```json
{
  "success": true,
  "data": {
    "userPoints": {
      "starlight": 0,
      "crystal": 0
    },
    "coupons": [...],
    "monthlyLimit": 2,
    "redeemedThisMonth": 0,
    "canRedeemMore": true
  }
}
```

#### 测试 redeemCoupon

**测试参数：**
```json
{
  "couponType": "coupon_50_200",
  "dormitoryId": "test_dorm",
  "pointsType": "starlight"
}
```

**预期结果（积分不足）：**
```json
{
  "success": false,
  "message": "星光值不足，需要 5000，当前只有 0"
}
```

**预期结果（成功）：**
```json
{
  "success": true,
  "message": "兑换成功！优惠券已发放到\"我的优惠券\"",
  "data": {
    "couponId": "...",
    "couponValue": 50,
    "pointsCost": 5000,
    "expireAt": ...
  }
}
```

#### 测试 getUserCoupons

**测试参数：**
```json
{}
```

**预期结果：**
```json
{
  "success": true,
  "data": {
    "all": [...],
    "unused": [...],
    "used": [],
    "expired": [],
    "stats": {
      "total": 1,
      "unused": 1,
      "used": 0,
      "expired": 0
    }
  }
}
```

#### 测试 useCoupon

**测试参数：**
```json
{
  "couponId": "测试获取的 couponId"
}
```

**预期结果：**
```json
{
  "success": true,
  "message": "优惠券使用成功！立减¥50",
  "data": {
    "couponId": "...",
    "usedAt": ...
  }
}
```

### 第六步：防刷机制测试

1. 给用户添加 10000 星光值（云开发控制台 → 数据库 → members → 编辑）
2. 调用 `redeemCoupon` 兑换第一张优惠券
   - [ ] 应该成功
3. 再次调用 `redeemCoupon` 兑换第二张优惠券
   - [ ] 应该成功
4. 第三次调用 `redeemCoupon`
   - [ ] 应该失败，提示"本月已兑换 2 张优惠券，已达上限"

### 第七步：事务处理测试

1. 在 `redeemCoupon` 函数中模拟事务失败（临时修改代码）
2. 调用 `redeemCoupon`
3. 检查用户积分是否回滚
   - [ ] 积分应该没有被扣减
4. 检查是否没有创建优惠券记录
   - [ ] couponRedemptions 集合中应该没有新记录

---

## 🐛 常见问题

### 问题 1：集合不存在

**错误信息：** `集合 [couponRedemptions] 不存在`

**解决方案：**
1. 执行 `init-commercial-db.js` 初始化脚本
2. 或手动在云开发控制台创建集合

### 问题 2：字段不存在

**错误信息：** `字段 [starlightPoints] 不存在`

**解决方案：**
1. 在云开发控制台 → 数据库 → members
2. 添加字段 `starlightPoints` (Number, 默认 0)
3. 添加字段 `crystalDiamonds` (Number, 默认 0)

### 问题 3：权限不足

**错误信息：** `ERR_DB_PERMISSION_DENIED`

**解决方案：**
1. 检查数据库权限设置
2. 确保设置为"所有用户可读写"或自定义权限正确

### 问题 4：索引不存在

**错误信息：** `索引不存在`

**解决方案：**
1. 在云开发控制台 → 数据库 → 选择集合 → 索引管理
2. 手动添加相应索引

---

## 📊 验收标准

### 功能验收

- [ ] 用户可以查看积分商城和优惠券列表
- [ ] 用户可以查看自己的积分余额
- [ ] 用户可以兑换优惠券（积分足够时）
- [ ] 兑换后积分正确扣减
- [ ] 兑换后优惠券正确发放
- [ ] 用户可以查看自己的优惠券
- [ ] 优惠券可以正常使用
- [ ] 使用后优惠券状态更新为"已使用"

### 防刷验收

- [ ] 每人每月最多兑换 2 张优惠券
- [ ] 超过限制后无法继续兑换
- [ ] 自然月后限制重置

### 事务验收

- [ ] 积分扣减和优惠券创建同时成功或同时失败
- [ ] 失败时积分正确回滚
- [ ] 数据一致性得到保证

### 错误处理验收

- [ ] 积分不足时有友好提示
- [ ] 已达上限时有友好提示
- [ ] 优惠券不存在时有友好提示
- [ ] 优惠券已使用时有友好提示
- [ ] 优惠券过期时有友好提示

---

## ✅ 验收签字

**开发者：** 玄枢  
**验收人：** 瓜瓜 🐾  
**验收日期：** ___________  
**验收结果：** □ 通过  □ 不通过

**备注：**
_________________________________
_________________________________

---

**完成后请向瓜瓜汇报，等待验收！** 🐾
