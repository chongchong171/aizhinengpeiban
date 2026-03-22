// pages/index/index.js - 优化版 v2.0

const app = getApp();

Page({
  data: {
    aiName: '瓜瓜',
    dailyQuote: '',
    currentDate: '',
    currentTime: '',
    userLevel: 1,
    userStars: '⭐⭐',
    companyDays: 7
  },

  onLoad() {
    this.setData({
      aiName: app.globalData.aiName || '瓜瓜'
    });
    this.updateDateTime();
    this.setDailyQuote();
    this.loadUserInfo();
    
    // 每分钟更新时间
    setInterval(() => {
      this.updateDateTime();
    }, 60000);
  },

  onShow() {
    // 每次显示时刷新数据
  },

  // 更新日期时间
  updateDateTime() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[now.getDay()];
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    this.setData({
      currentDate: `${month}月${day}日 ${weekday}`,
      currentTime: `${hours}:${minutes}`
    });
  },

  // 加载用户信息
  loadUserInfo() {
    // 模拟用户信息（实际应该从本地存储或云端读取）
    const userInfo = {
      level: 3,
      stars: '⭐⭐⭐',
      companyDays: 7
    };
    
    this.setData({
      userLevel: userInfo.level,
      userStars: userInfo.stars,
      companyDays: userInfo.companyDays
    });
  },

  // 快捷聊天
  quickChat() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    });
  },

  // 记录心情
  recordMood() {
    wx.showActionSheet({
      itemList: ['😊 开心', '😐 平静', '😢 难过', '😫 疲惫', '😰 焦虑'],
      success: (res) => {
        const moods = ['开心', '平静', '难过', '疲惫', '焦虑'];
        wx.showToast({
          title: `今天心情：${moods[res.tapIndex]}`,
          icon: 'none'
        });
      }
    });
  },

  // 设置每日寄语
  setDailyQuote() {
    const quotes = [
      '每一天都是新的开始，你值得拥有所有美好~ 💕',
      '累了就休息一下，我会一直陪着你~ 🤗',
      '你的感受很重要，记得好好照顾自己~ ✨',
      '无论发生什么，你都不是一个人~ 💖',
      '今天也要开心哦，你是最棒的~ 🌟',
      '慢慢来，一切都会好起来的~ 🌸',
      '你已经在做得很好了~ 🐾'
    ];
    
    const today = new Date().getDay();
    this.setData({
      dailyQuote: quotes[today % quotes.length]
    });
  },

  // 抱抱树洞互动
  hugTreeHole() {
    wx.vibrateShort({
      type: 'light'
    });
    
    wx.showToast({
      title: '🤗 瓜瓜抱抱你~',
      icon: 'none',
      duration: 2000
    });
    
    // 记录互动次数（可用于成就系统）
    console.log('树洞互动 +1');
  },

  // 导航
  navigateTo(e) {
    const { page } = e.currentTarget.dataset;
    wx.navigateTo({ url: page });
  }
});
