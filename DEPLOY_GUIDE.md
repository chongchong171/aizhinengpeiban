# 瓜瓜陪伴小程序 - 部署指南

## 第一步：上传云函数

在微信开发者工具中，右键点击 `cloudfunctions/` 下的每个文件夹 → "上传并部署：云端安装依赖"

**必须上传：**
- chat（AI对话）
- getOpenId（用户ID）
- initDatabase（初始化数据库）
- generateImage（晚安图）
- getConversations（对话历史）

## 第二步：创建数据库集合

云开发控制台 → 数据库 → 添加集合

**必须创建：**
- conversations（对话历史）
- chatRecords（聊天记录）
- imageGenerations（图片记录）
- users（用户信息）

## 第三步：测试

编译运行，测试 AI 对话功能