# 快速部署指南 - 女生宿舍商业化

## 🚀 5 分钟快速部署

### 步骤 1：初始化数据库（1 分钟）

1. 打开微信开发者工具
2. 点击"云开发"按钮
3. 进入"云函数"页面
4. 将 `init-commercial-db.js` 拖入 `cloudfunctions/` 目录
5. 右键 `init-commercial-db` → "上传并部署：云端安装依赖"
6. 点击"测试"按钮执行初始化
7. 查看日志，确认显示"数据库初始化完成"

### 步骤 2：上传云函数（2 分钟）

依次右键以下云函数 → "上传并部署：云端安装依赖"：

1. `getPointsShop`
2. `redeemCoupon`
3. `getUserCoupons`
4. `useCoupon`

**等待每个函数部署完成！**

### 步骤 3：配置数据库权限（1 分钟）

1. 云开发控制台 → 数据库
2. 选择 `couponRedemptions` 集合
3. 点击"权限管理"
4. 选择"自定义规则"
5. 输入：
   ```json
   {
     "read": "auth.openid == doc.userId",
     "write": "auth.openid == doc.userId"
   }
   ```
6. 同样配置 `taskRecords` 和 `members` 集合

### 步骤 4：测试验证（1 分钟）

1. 云开发控制台 → 云函数
2. 选择 `getPointsShop` → "测试"
3. 查看返回结果：
   ```json
   {
     "success": true,
     "data": {
       "userPoints": { "starlight": 0, "crystal": 0 },
       "coupons": [...],
       "monthlyLimit": 2,
       "redeemedThisMonth": 0,
       "canRedeemMore": true
     }
   }
   ```

## ✅ 部署完成！

现在可以在小程序中调用这些云函数了。

## 📖 详细文档

- 完整 API 文档：`cloudfunctions/README.md`
- 部署检查清单：`DEPLOYMENT_CHECKLIST.md`
- 完成报告：`COMMERCIAL_COMPLETION_REPORT.md`

## 🐛 遇到问题？

查看 `DEPLOYMENT_CHECKLIST.md` 中的"常见问题"部分。

---

**开发者：** 玄枢  
**日期：** 2026-03-17
