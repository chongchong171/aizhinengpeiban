# 🚀 快速部署指南

**版本：** v2.0  
**更新日期：** 2026-03-15

---

## 📋 部署前检查

### 1. 环境准备

- [ ] 微信开发者工具已安装（最新版本）
- [ ] 小程序 AppID 已获取
- [ ] 开发已绑定开发者账号

### 2. 文件检查

```bash
# 检查关键文件是否存在
cd /root/.openclaw/workspace/guagua-miniprogram

# 核心文件
ls -la app.js app.json app.wxss

# 首页文件
ls -la pages/index/

# 新增页面
ls -la pages/summary/ pages/read/ pages/recite/

# 图片资源
ls -la images/treehole/
```

---

## 🔧 部署步骤

### 步骤 1：导入项目

1. 打开 **微信开发者工具**
2. 点击 **+** 导入项目
3. 项目路径：`/root/.openclaw/workspace/guagua-miniprogram`
4. AppID：选择你的小程序 AppID
5. 点击 **导入**

### 步骤 2：配置 AppID

编辑 `project.config.json`：

```json
{
  "appid": "你的小程序 AppID",
  "projectname": "瓜瓜陪伴",
  ...
}
```

### 步骤 3：编译运行

1. 点击工具栏 **编译** 按钮
2. 查看模拟器效果
3. 检查控制台是否有错误

### 步骤 4：真机预览

1. 点击工具栏 **预览** 按钮
2. 使用微信扫码
3. 在真机上测试所有功能

### 步骤 5：上传代码

1. 点击工具栏 **上传** 按钮
2. 填写版本号和备注
3. 等待上传完成

### 步骤 6：提交审核

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入 **版本管理**
3. 选择刚上传的版本
4. 点击 **提交审核**

---

## ⚠️ 注意事项

### 1. 图片资源

**树洞形象 PNG 待生成：**

```bash
# 当前使用 SVG 占位
images/treehole/treehole-main.svg

# 需要生成 PNG 版本（350x350px）
# 可使用阿里云通义万相生成
```

**临时方案：**
- 在微信开发者工具中，SVG 可能无法直接显示
- 可先用任意 350x350 PNG 替换
- 或修改代码使用 base64 占位图

### 2. 页面路由

确保 `app.json` 中所有页面路径正确：

```json
{
  "pages": [
    "pages/index/index",
    "pages/chat/chat",
    "pages/summary/summary",
    "pages/stories/stories",
    "pages/relax/relax",
    "pages/read/read",
    "pages/recite/recite",
    "pages/profile/profile"
  ]
}
```

### 3. 权限配置

**录音功能需要权限：**

在 `app.json` 中添加：

```json
{
  "permission": {
    "scope.record": {
      "desc": "用于录音功能"
    }
  }
}
```

### 4. TTS 功能

**当前状态：** 使用 placeholder，未接入真实 TTS

**接入方案：**
1. 阿里云智能语音交互
2. 腾讯云语音合成
3. 百度语音合成

**示例（阿里云）：**

```javascript
// 调用云函数生成 TTS 音频
wx.cloud.callFunction({
  name: 'tts',
  data: { text: '要朗读的文字' }
})
```

---

## 🧪 测试清单

### 功能测试

- [ ] 首页能正常打开
- [ ] 树洞形象显示正常
- [ ] 所有功能入口可点击
- [ ] 树洞倾诉页面正常
- [ ] 今日总结页面正常
- [ ] 睡前故事页面正常
- [ ] 放松引导页面正常
- [ ] 瓜瓜读给你听页面正常
- [ ] 朗读功能页面正常
- [ ] 个人中心页面正常

### 兼容性测试

- [ ] iPhone 测试
- [ ] Android 测试
- [ ] 不同屏幕尺寸测试
- [ ] 微信版本兼容性

### 性能测试

- [ ] 页面加载速度
- [ ] 图片加载速度
- [ ] 内存占用
- [ ] 流量消耗

---

## 🐛 常见问题

### Q1: 图片不显示

**原因：** 路径错误或格式不支持

**解决：**
```javascript
// 检查图片路径
// 使用绝对路径：/images/xxx.png
// 确保图片文件存在
```

### Q2: 页面跳转失败

**原因：** 路由配置错误

**解决：**
```javascript
// 检查 app.json 中的 pages 数组
// 确保页面路径正确
// 确保页面文件存在（.wxml/.wxss/.js/.json）
```

### Q3: 录音权限被拒绝

**原因：** 用户未授权

**解决：**
```javascript
// 引导用户开启权限
wx.openSetting({
  success: (res) => {
    console.log(res.authSetting)
  }
})
```

### Q4: 编译报错

**原因：** 语法错误或配置错误

**解决：**
```bash
# 检查控制台错误信息
# 查看具体错误位置
# 修复后重新编译
```

---

## 📞 技术支持

遇到问题可联系：

- **开发者：** 玄枢
- **文档：** 查看 `HOME_REDESIGN.md` 和 `FEATURE_GUIDE.md`
- **问题反馈：** 在项目中创建 issue

---

## 🎉 部署完成

部署成功后，你应该能够：

1. ✅ 在微信开发者工具中看到完整效果
2. ✅ 在真机上正常使用所有功能
3. ✅ 提交代码到微信审核

**下一步：**
- 等待审核通过
- 发布上线
- 收集用户反馈
- 持续迭代优化

---

**祝部署顺利！** 🐾
