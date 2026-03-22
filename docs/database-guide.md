# 瓜瓜陪伴小程序 - 数据库集合说明

## 📚 集合列表

### 1. dormitory（宿舍信息）

存储宿舍基本信息

**字段说明：**
```javascript
{
  _id: String,              // 自动生成
  _openid: String,          // 创建者 openid
  name: String,             // 宿舍名称
  style: String,            // 风格（温馨/可爱/简约）
  memberCount: Number,      // 人数（4/6/8）
  ageRange: String,         // 年龄段
  introduction: String,     // 宿舍介绍
  creator: String,          // 创建者 openid
  createTime: Date,         // 创建时间
  updateTime: Date          // 更新时间
}
```

**索引：**
- `_openid` (升序)
- `createTime` (降序)

---

### 2. dormitoryMember（宿舍成员/邀请记录）⭐

存储宿舍成员和邀请记录

**字段说明：**
```javascript
{
  _id: String,                    // 自动生成
  dormitoryId: String,            // 宿舍 ID
  dormitoryName: String,          // 宿舍名称
  
  // 邀请人信息
  inviterOpenId: String,          // 邀请人 openid
  inviterName: String,            // 邀请人昵称
  inviterAvatar: String,          // 邀请人头像
  
  // 被邀请人信息
  invitedUserOpenId: String,      // 被邀请人 openid
  invitedUserName: String,        // 被邀请人昵称
  invitedUserAvatar: String,      // 被邀请人头像
  
  // 邀请信息
  inviteMessage: String,          // 邀请语
  inviteType: String,             // 类型：'invite'（邀请）| 'join'（申请加入）
  status: String,                 // 状态：'pending'（待处理）| 'accepted'（已接受）| 'rejected'（已拒绝）
  
  // 时间戳
  createTime: Date,               // 创建时间
  updateTime: Date                // 更新时间
}
```

**索引：**
- `dormitoryId` (升序) - 用于查询某宿舍的所有邀请记录
- `inviterOpenId` (升序) - 用于查询某人发出的邀请
- `invitedUserOpenId` (升序) - 用于查询某人收到的邀请
- `createTime` (降序) - 用于按时间排序
- 复合索引：`dormitoryId + status` - 用于查询某宿舍的待处理邀请

**使用场景：**
1. 发送邀请时：创建一条 `inviteType: 'invite'`, `status: 'pending'` 的记录
2. 接受邀请时：更新 `status: 'accepted'`，并添加成员到宿舍
3. 拒绝邀请时：更新 `status: 'rejected'`
4. 查询邀请记录：根据 `dormitoryId` 查询所有邀请

---

### 3. dormitoryTask（宿舍任务）

存储宿舍每日任务

**字段说明：**
```javascript
{
  _id: String,
  dormitoryId: String,
  taskName: String,
  taskType: String,           // 'daily'（每日）| 'weekly'（每周）| 'custom'（自定义）
  description: String,
  points: Number,             // 完成奖励积分
  status: String,             // 'active' | 'completed' | 'expired'
  completedBy: Array,         // 完成者 openid 列表
  createTime: Date,
  expireTime: Date
}
```

---

### 4. dormitoryPost（宿舍动态）

存储宿舍成员发布的动态

**字段说明：**
```javascript
{
  _id: String,
  dormitoryId: String,
  authorOpenId: String,
  authorName: String,
  authorAvatar: String,
  content: String,
  images: Array,
  likes: Array,               // 点赞者 openid 列表
  comments: Array,            // 评论列表
  createTime: Date
}
```

---

## 🔧 云函数列表

### getDormitoryInfo
获取宿舍详细信息

**输入：**
```javascript
{
  dormitoryId: String
}
```

**输出：**
```javascript
{
  success: Boolean,
  dormitory: Object,
  message: String
}
```

---

### createDormitory
创建新宿舍

**输入：**
```javascript
{
  name: String,
  style: String,
  memberCount: Number,
  ageRange: String,
  introduction: String,
  creator: String
}
```

**输出：**
```javascript
{
  success: Boolean,
  dormitoryId: String,
  message: String
}
```

---

### createInvite
发送邀请（已集成到前端直接操作数据库）

**说明：** 为简化架构，邀请功能直接在前端操作 `dormitoryMember` 集合，无需云函数

---

### getInviteRecords
获取邀请记录列表

**输入：**
```javascript
{
  dormitoryId: String
}
```

**输出：**
```javascript
{
  success: Boolean,
  records: Array,
  message: String
}
```

---

## 📝 数据库初始化

### 创建集合
在微信开发者工具中：
1. 打开"云开发"控制台
2. 进入"数据库"
3. 点击"添加集合"
4. 输入集合名称：`dormitory`、`dormitoryMember`、`dormitoryTask`、`dormitoryPost`

### 设置权限
建议设置：
- `dormitory`: 所有用户可读，仅创建者可写
- `dormitoryMember`: 所有用户可读，仅创建者可写
- `dormitoryTask`: 所有用户可读，仅管理员可写
- `dormitoryPost`: 所有用户可读，仅创建者可写

**权限规则示例（dormitoryMember）：**
```json
{
  "read": "auth.openid != null",
  "write": "auth.openid == resource.data.inviterOpenId || auth.openid == resource.data.invitedUserOpenId"
}
```

---

## 🎯 邀请流程说明

### 1. 发送邀请
```javascript
// 前端直接操作数据库
const db = wx.cloud.database();
await db.collection('dormitoryMember').add({
  data: {
    dormitoryId: 'xxx',
    inviterOpenId: '当前用户 openid',
    invitedUserOpenId: '好友 openid',
    inviteType: 'invite',
    status: 'pending',
    createTime: db.serverDate()
  }
});
```

### 2. 查看邀请
```javascript
// 查询某宿舍的所有邀请
const result = await db.collection('dormitoryMember')
  .where({
    dormitoryId: 'xxx',
    inviteType: 'invite'
  })
  .orderBy('createTime', 'desc')
  .get();
```

### 3. 接受邀请
```javascript
// 更新邀请状态
await db.collection('dormitoryMember').doc(recordId).update({
  data: {
    status: 'accepted',
    updateTime: db.serverDate()
  }
});

// 同时添加成员到宿舍成员列表（如有独立成员表）
```

---

## ⚠️ 注意事项

1. **微信开放数据域**
   - 小程序无法直接获取用户好友列表
   - 需要通过 `wx.getFriendCloudStorage` 获取授权好友数据
   - 或使用分享场景传递用户信息

2. **隐私保护**
   - 所有 openid 仅用于内部识别，不对外展示
   - 用户昵称和头像需符合微信规范

3. **数据清理**
   - 定期清理过期的邀请记录（如 30 天前的 pending 记录）
   - 使用云函数定时任务执行清理

---

**文档更新日期：** 2026-03-15  
**更新人：** 玄枢 2
