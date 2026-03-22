/**
 * 瓜瓜读给你听 - 朗读页面逻辑
 * @description 用户上传文字，AI TTS 朗读
 * @author 玄枢
 * @date 2026-03-15
 * @update 2026-03-15 - 添加动态 AI 名字显示
 */

// 引入 AI 名字管理工具
const aiNameUtil = require('../../utils/ai-name.js');

Page({
  data: {
    inputText: '',
    voice: 'male', // 'female' | 'male'
    speed: 'medium', // 'slow' | 'medium' | 'fast'
    isPlaying: false,
    readingList: [],
    audioContext: null,
    aiName: '瓜瓜'  // AI 名字
  },

  onLoad() {
    // 获取 AI 名字
    this.loadAiName();
    
    // 创建音频上下文
    this.setData({
      audioContext: wx.createInnerAudioContext()
    });

    // 从本地存储加载朗读列表
    this.loadReadingList();
  },

  /**
   * 加载 AI 名字
   */
  loadAiName() {
    const name = aiNameUtil.getName();
    this.setData({ aiName: name });
  },

  onUnload() {
    // 清理音频上下文
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }
  },

  // 文本输入处理
  onTextInput(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 选择声音
  selectVoice(e) {
    const voice = e.currentTarget.dataset.voice;
    this.setData({ voice });
  },

  // 选择语速
  selectSpeed(e) {
    const speed = e.currentTarget.dataset.speed;
    this.setData({ speed });
  },

  // 播放音频（TTS 占位实现）
  playAudio() {
    if (!this.data.inputText.trim()) {
      wx.showToast({
        title: '请先输入内容',
        icon: 'none'
      });
      return;
    }

    if (this.data.isPlaying) {
      return;
    }

    // TODO: 对接真实 TTS API
    // 目前使用占位实现
    this.setData({ isPlaying: true });

    wx.showToast({
      title: '开始朗读',
      icon: 'none'
    });

    // 模拟播放（实际应调用 TTS API）
    console.log('TTS 朗读请求:', {
      text: this.data.inputText,
      voice: this.data.voice,
      speed: this.data.speed
    });

    // 模拟播放完成
    setTimeout(() => {
      this.setData({ isPlaying: false });
      wx.showToast({
        title: '朗读完成',
        icon: 'success'
      });
    }, 5000);
  },

  // 暂停音频
  pauseAudio() {
    if (!this.data.isPlaying) {
      return;
    }

    this.setData({ isPlaying: false });
    wx.showToast({
      title: '已暂停',
      icon: 'none'
    });

    // TODO: 实际应暂停 TTS 播放
  },

  // 保存朗读记录
  saveReading() {
    if (!this.data.inputText.trim()) {
      wx.showToast({
        title: '请先输入内容',
        icon: 'none'
      });
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // 生成标题（取前 20 个字）
    const title = this.data.inputText.length > 20 
      ? this.data.inputText.substring(0, 20) + '...' 
      : this.data.inputText;

    const newRecord = {
      id: Date.now(),
      title: title,
      content: this.data.inputText,
      date: dateStr,
      voice: this.data.voice,
      speed: this.data.speed,
      createdAt: now.getTime()
    };

    const readingList = [newRecord, ...this.data.readingList];

    // 保存到本地存储
    wx.setStorageSync('readingList', readingList);

    this.setData({ readingList });

    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  // 加载朗读列表
  loadReadingList() {
    const readingList = wx.getStorageSync('readingList') || [];
    this.setData({ readingList });
  },

  // 加载某条朗读记录
  loadReading(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.readingList[index];

    if (record) {
      this.setData({
        inputText: record.content,
        voice: record.voice,
        speed: record.speed
      });

      wx.showToast({
        title: '已加载',
        icon: 'none'
      });
    }
  },

  // 删除朗读记录
  deleteReading(e) {
    const index = e.currentTarget.dataset.index;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条朗读记录吗？',
      success: (res) => {
        if (res.confirm) {
          const readingList = this.data.readingList.filter((_, i) => i !== index);
          wx.setStorageSync('readingList', readingList);
          this.setData({ readingList });

          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
