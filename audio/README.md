# 放松引导功能 - 音频文件说明

## 所需音频文件

请将以下音频文件放置在此 `/audio` 目录下：

### 背景音文件

1. **rain.mp3** - 雨声背景音
   - 建议时长：循环播放版本（3-5 分钟）
   - 格式：MP3
   - 用途：呼吸练习、想象放松（雨天场景）

2. **ocean.mp3** - 海浪声背景音
   - 建议时长：循环播放版本（3-5 分钟）
   - 格式：MP3
   - 用途：呼吸练习、想象放松（海滩场景）

3. **forest.mp3** - 森林环境音
   - 建议时长：循环播放版本（3-5 分钟）
   - 格式：MP3
   - 用途：呼吸练习、想象放松（森林场景）

4. **relax_music.mp3** - 轻柔放松音乐
   - 建议时长：10-15 分钟
   - 格式：MP3
   - 用途：身体扫描页面背景音乐

5. **ambient.mp3** - 环境氛围音乐
   - 建议时长：循环播放版本（5-10 分钟）
   - 格式：MP3
   - 用途：想象放松（云端场景）

## 音频资源获取建议

### 免费资源网站
- **Freesound** (https://freesound.org/) - CC 许可的免费音效
- **YouTube Audio Library** - 免费背景音乐
- **Pixabay Music** (https://pixabay.com/music/) - 免费可商用音乐
- **Mixkit** (https://mixkit.co/) - 免费音效和音乐

### 搜索关键词
- Rain sounds / 雨声
- Ocean waves / 海浪声
- Forest ambience / 森林环境音
- Relaxation music / 放松音乐
- Meditation music / 冥想音乐
- Ambient sound / 环境音

## 音频格式要求

- **格式**: MP3
- **采样率**: 44.1kHz 或 48kHz
- **比特率**: 128kbps 或更高
- **声道**: 立体声

## 临时测试

如果暂时没有音频文件，小程序可以正常运行，但背景音功能将无法播放。TTS 语音引导使用占位函数，后期可对接：
- 微信同声传译插件
- 阿里云 TTS 服务
- 百度 TTS 服务
- 其他第三方 TTS API

## 文件结构

```
guagua-miniprogram/
├── audio/
│   ├── rain.mp3          # 雨声
│   ├── ocean.mp3         # 海浪声
│   ├── forest.mp3        # 森林声
│   ├── relax_music.mp3   # 放松音乐
│   └── ambient.mp3       # 环境音
└── pages/
    └── relax/
        ├── breath/       # 呼吸练习页面
        ├── body-scan/    # 身体扫描页面
        ├── imagination/  # 想象放松页面
        └── quick/        # 快速放松页面
```

## 注意事项

1. 音频文件较大，建议使用 Git LFS 或单独管理
2. 确保音频文件有合法使用权限
3. 测试时注意音量不要过大
4. 考虑添加音量控制功能（已实现）
5. 考虑添加音频预加载功能

---
**创建日期**: 2026-03-15
**作者**: 玄枢
