// pages/chat/chat.js - 女性化优化版

const app = getApp();

Page({
  data: {
    messages: [],
    inputValue: '',
    loading: false,
    scrollToView: '',
    aiName: '瓜瓜',
    currentMood: ''
  },

  onLoad() {
    // 获取 AI 名字
    this.setData({
      aiName: app.globalData.aiName || '瓜瓜'
    });
    
    // 加载欢迎消息
    this.loadWelcomeMessage();
  },

  // 加载欢迎消息
  loadWelcomeMessage() {
    // 这里可以加载历史聊天记录
    // 暂时为空
  },

  // 选择心情
  selectMood(e) {
    const { mood } = e.currentTarget.dataset;
    const moodMap = {
      happy: '😊 开心',
      normal: '😐 平静',
      sad: '😢 难过',
      tired: '😫 疲惫',
      anxious: '😰 焦虑'
    };
    
    this.setData({
      currentMood: mood
    });
    
    // 自动发送心情消息
    this.sendMessageWithContent(`今天心情：${moodMap[mood]}`);
    
    wx.showToast({
      title: '心情已记录',
      icon: 'success'
    });
  },

  // 快捷开始
  quickStart(e) {
    const { type } = e.currentTarget.dataset;
    const quickMessages = {
      happy: '今天遇到了开心的事，想和你分享~ ✨',
      sad: '今天心情不太好，求安慰~ 🤗',
      chat: '无聊了，想和你聊聊天~ 💕'
    };
    
    this.sendMessageWithContent(quickMessages[type]);
  },

  // 输入变化
  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 显示表情
  showEmojiPicker() {
    wx.showToast({
      title: '表情功能开发中~',
      icon: 'none'
    });
  },

  // 发送消息
  sendMessage() {
    if (!this.data.inputValue.trim()) {
      return;
    }
    
    const content = this.data.inputValue.trim();
    this.sendMessageWithContent(content);
  },

  // 发送消息（带内容）
  sendMessageWithContent(content) {
    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: content,
      time: this.getCurrentTime()
    };
    
    this.setData({
      messages: [...this.data.messages, userMessage],
      inputValue: '',
      loading: true,
      scrollToView: 'msg-' + userMessage.id
    });
    
    // 调用云函数获取 AI 回复
    this.callAIAPI(content);
  },

  // 调用云函数获取 AI 回复
  callAIAPI(userContent) {
    wx.cloud.callFunction({
      name: 'chat',
      data: {
        message: userContent,
        conversationId: this.data.conversationId || 'default'
      },
      success: (res) => {
        console.log('AI 回复成功:', res);
        
        if (res.result && res.result.success) {
          const botMessage = {
            id: Date.now() + 1,
            type: 'bot',
            content: res.result.data.response,
            time: this.getCurrentTime()
          };
          
          this.setData({
            messages: [...this.data.messages, botMessage],
            loading: false,
            scrollToView: 'msg-' + botMessage.id,
            conversationId: res.result.data.conversationId
          });
        } else {
          // API 调用失败，显示错误消息
          const errorMessage = {
            id: Date.now() + 1,
            type: 'bot',
            content: res.result?.message || '瓜瓜暂时有点累，请稍后再试~ 🥺',
            time: this.getCurrentTime()
          };
          
          this.setData({
            messages: [...this.data.messages, errorMessage],
            loading: false,
            scrollToView: 'msg-' + errorMessage.id
          });
        }
      },
      fail: (err) => {
        console.error('AI 调用失败:', err);
        
        // 网络错误或其他错误
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: '瓜瓜网络不太好，请稍后再试~ 🥺',
          time: this.getCurrentTime()
        };
        
        this.setData({
          messages: [...this.data.messages, errorMessage],
          loading: false,
          scrollToView: 'msg-' + errorMessage.id
        });
      }
    });
  },

  // 获取当前时间
  getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 加载更多消息
  loadMoreMessages() {
    // 加载更多历史消息
  }
});
