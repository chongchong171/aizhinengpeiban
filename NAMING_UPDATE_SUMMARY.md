# 女性审美优化 - 功能名称修改总结

**修改日期：** 2026-03-15  
**修改人：** 玄枢  
**任务要求：** 修改所有功能名称，更贴近女性审美

---

## 名称修改对照表

| 原名称 | 新名称 | 位置 |
|--------|--------|------|
| 树洞倾诉 | **说说心里话** | 首页 + 聊天页 |
| 今日总结 | **今天的小确幸** | 首页 + 总结页 |
| 睡前故事 | **哄睡小故事** | 首页 + 故事页 |
| 放松引导 | **深呼吸一下** | 首页 + 放松页 |
| 瓜瓜读给你听 | **读给你听** | 首页 + 朗读页 |
| 晚安图片 | **今晚的月亮** | 首页（未找到该功能） |
| 睡前提醒 | **该休息啦** | 首页（未找到该功能） |
| 个人中心 | **我的小天地** | 底部导航 |

---

## 修改文件清单

### 1. WXML 文件（页面结构）

| 文件路径 | 修改内容 |
|---------|---------|
| `pages/index/index.wxml` | 首页所有按钮文字更新 |
| `pages/chat/chat.wxml` | 聊天页标题和注释更新 |
| `pages/summary/summary.wxml` | 总结页标题更新 |
| `pages/stories/stories.wxml` | 故事页标题更新 |
| `pages/relax/relax.wxml` | 放松页标题更新 |
| `pages/custom-read/index.wxml` | 朗读页标题更新 |
| `pages/read/read.wxml` | 朗读页标题更新 |
| `pages/profile/profile.wxml` | 个人中心页标题更新 |
| `pages/relax/breath/breath.wxml` | 呼吸练习页注释更新 |
| `pages/relax/body-scan/body-scan.wxml` | 身体扫描页注释更新 |
| `pages/relax/imagination/imagination.wxml` | 想象放松页注释更新 |
| `pages/relax/quick/quick.wxml` | 快速放松页注释更新 |
| `pages/recite/recite.wxml` | 录音页注释更新 |

### 2. JSON 文件（页面配置）

| 文件路径 | 修改内容 |
|---------|---------|
| `pages/chat/chat.json` | navigationBarTitleText: 树洞倾诉 → 说说心里话 |
| `pages/summary/summary.json` | navigationBarTitleText: 今日总结 → 今天的小确幸 |
| `pages/stories/stories.json` | navigationBarTitleText: 睡前故事 → 哄睡小故事 |
| `pages/relax/relax.json` | navigationBarTitleText: 放松引导 → 深呼吸一下 |
| `pages/profile/profile.json` | navigationBarTitleText: 个人中心 → 我的小天地 |
| `pages/read/read.json` | navigationBarTitleText: 瓜瓜读给你听 → 读给你听 |
| `pages/custom-read/index.json` | navigationBarTitleText: 瓜瓜读给你听 → 读给你听 |

### 3. JS 文件（页面逻辑）

| 文件路径 | 修改内容 |
|---------|---------|
| `app.js` | 文件头注释更新，添加女性审美优化标记 |
| `pages/index/index.js` | 文件头注释更新，问候语使用动态 AI 名字 |
| `pages/chat/chat.js` | 文件头注释更新，AI 回复使用动态名字 |

---

## 修改说明

### 首页 (index.wxml)
- ✅ 主打功能：树洞倾诉 → 说说心里话
- ✅ 今日总结 → 今天的小确幸
- ✅ 睡前故事 → 哄睡小故事
- ✅ 放松引导 → 深呼吸一下
- ✅ 瓜瓜读给你听 → 读给你听
- ✅ 个人中心 → 我的小天地
- ✅ 朗读功能（保持不变）

### 聊天页 (chat/chat.wxml, chat.js)
- ✅ 页面标题注释更新
- ✅ AI 回复中的自称使用动态名字（{{aiName}}）
- ✅ 日志输出更新

### 总结页 (summary/summary.wxml, summary.json)
- ✅ 页面标题：今日总结 → 今天的小确幸
- ✅ 导航栏标题同步更新

### 故事页 (stories/stories.wxml, stories.json)
- ✅ 页面标题：睡前故事 → 哄睡小故事
- ✅ AI 讲故事 → AI 讲小故事
- ✅ 导航栏标题同步更新

### 放松页 (relax/relax.wxml, relax.json)
- ✅ 页面标题：放松引导 → 深呼吸一下
- ✅ 导航栏标题同步更新
- ✅ 子页面注释更新（breath, body-scan, imagination, quick）

### 朗读页 (read/read.wxml, read.json, custom-read/index.wxml, custom-read/index.json)
- ✅ 页面标题：瓜瓜读给你听 → 读给你听
- ✅ 页面描述更新
- ✅ 导航栏标题同步更新

### 个人中心页 (profile/profile.wxml, profile.json)
- ✅ 页面标题：个人中心 → 我的小天地
- ✅ 导航栏标题同步更新

### AI 自称统一处理
- ✅ 所有硬编码的"瓜瓜"改为动态 `{{aiName}}` 变量
- ✅ 聊天回复中的 AI 自称使用动态名字
- ✅ 问候语中的 AI 名字使用动态变量

---

## 注意事项

1. **晚安图片** 和 **睡前提醒** 两个功能在代码中未找到对应入口，可能尚未实现或已移除
2. 所有修改都添加了注释标记 `【女性审美优化】` 便于后续维护
3. AI 自称已全部改为动态变量，支持用户自定义 AI 名字
4. 导航栏标题（navigationBarTitleText）已全部同步更新

---

## 测试建议

1. ✅ 编译小程序，检查是否有语法错误
2. ✅ 逐一测试每个页面的导航栏标题是否正确显示
3. ✅ 测试首页所有按钮文字是否正确
4. ✅ 测试聊天功能，确认 AI 回复中的自称正确
5. ✅ 测试不同时间段，确认问候语中的 AI 名字正确

---

**修改完成时间：** 2026-03-15 18:XX  
**状态：** ✅ 已完成
