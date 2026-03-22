/**
 * 今日亮点页面逻辑
 * @description 成就记录和心情展示
 * @author 玄枢
 * @date 2026-03-15
 */

Page({
  /**
   * 页面数据
   */
  data: {
    todayDate: '',              // 今日日期
    achievements: [],           // 成就列表
    currentMood: {              // 当前心情
      emoji: '😊',
      text: '开心'
    },
    moodStats: {                // 心情统计
      happy: 0,
      calm: 0,
      touched: 0
    },
    encouragement: '',          // 鼓励语
    showDialog: false,          // 是否显示弹窗
    newAchievement: ''          // 新成就内容
  },

  /**
   * 页面加载
   */
  onLoad() {
    this.initDate();
    this.loadAchievements();
    this.loadMoodData();  // 加载心情数据
    this.setEncouragement();
  },

  /**
   * 初始化日期显示
   */
  initDate() {
    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    
    this.setData({
      todayDate: `${month}月${day}日 ${weekday}`
    });
  },

  /**
   * 加载成就列表
   */
  loadAchievements() {
    const achievements = wx.getStorageSync('achievements') || [];
    
    // 筛选今天的成就
    const today = new Date().toDateString();
    const todayAchievements = achievements.filter(item => {
      return new Date(item.timestamp).toDateString() === today;
    });

    this.setData({
      achievements: todayAchievements
    });
  },

  /**
   * 加载心情数据
   */
  loadMoodData() {
    // 从本地存储加载心情记录
    const moodRecords = wx.getStorageSync('moodRecords') || [];
    
    // 筛选今天的心情记录
    const today = new Date().toDateString();
    const todayMoods = moodRecords.filter(item => {
      return new Date(item.timestamp).toDateString() === today;
    });
    
    // 统计心情数据
    const moodStats = {
      happy: 0,
      calm: 0,
      touched: 0
    };
    
    // 默认心情
    let currentMood = {
      emoji: '😊',
      text: '开心'
    };
    
    // 统计各种心情的数量
    todayMoods.forEach(mood => {
      if (mood.type === 'happy') {
        moodStats.happy++;
        currentMood = { emoji: '😊', text: '开心' };
      } else if (mood.type === 'calm') {
        moodStats.calm++;
        currentMood = { emoji: '😌', text: '平静' };
      } else if (mood.type === 'touched') {
        moodStats.touched++;
        currentMood = { emoji: '🥺', text: '感动' };
      }
    });
    
    // 如果没有今天的心情记录，使用默认值
    if (todayMoods.length === 0) {
      // 保持默认值
    }
    
    this.setData({
      currentMood,
      moodStats
    });
  },

  /**
   * 设置鼓励语
   */
  setEncouragement() {
    const encouragements = [
      '女王大人今天也超级棒！每一个小成就都值得庆祝呢！🎉',
      '看到你的成长，瓜瓜真的好开心！继续保持哦~ 💕',
      '你比昨天更优秀了，这就是最大的进步！🌟',
      '每一步都算数，每一刻都珍贵，你真的很了不起！✨',
      '今天的你，又是闪闪发光的一天呢！🐾'
    ];
    
    const randomIndex = Math.floor(Math.random() * encouragements.length);
    this.setData({
      encouragement: encouragements[randomIndex]
    });
  },

  /**
   * 显示添加成就弹窗
   */
  showAddAchievement() {
    this.setData({
      showDialog: true,
      newAchievement: ''
    });
  },

  /**
   * 取消添加成就
   */
  cancelAddAchievement() {
    this.setData({
      showDialog: false
    });
  },

  /**
   * 确认添加成就
   */
  confirmAddAchievement() {
    const content = this.data.newAchievement.trim();
    
    if (!content) {
      wx.showToast({
        title: '请输入成就内容',
        icon: 'none'
      });
      return;
    }

    const achievement = {
      id: Date.now(),
      content: content,
      icon: this.getRandomIcon(),
      time: this.formatTime(new Date()),
      timestamp: Date.now()
    };

    const achievements = [...this.data.achievements, achievement];
    
    // 保存到本地存储
    const allAchievements = wx.getStorageSync('achievements') || [];
    allAchievements.push(achievement);
    wx.setStorageSync('achievements', allAchievements);

    this.setData({
      achievements,
      showDialog: false
    });

    wx.showToast({
      title: '记录成功！',
      icon: 'success'
    });
  },

  /**
   * 成就输入变化
   */
  onAchievementInput(e) {
    this.setData({
      newAchievement: e.detail.value
    });
  },

  /**
   * 获取随机图标
   */
  getRandomIcon() {
    const icons = ['🎯', '⭐', '🏆', '💪', '✨', '🌟', '💖', '🎉'];
    return icons[Math.floor(Math.random() * icons.length)];
  },

  /**
   * 格式化时间
   */
  formatTime(date) {
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }
});
