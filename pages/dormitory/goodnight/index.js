// pages/dormitory/goodnight/goodnight.js
Page({
  data: {
    dormitoryId: '',
    hasCheckedIn: false,
    checkInTime: null,
    todayCheckins: [],
    totalCount: 0,
    checkedInCount: 0,
    currentHour: 0,
    isSleepTime: false,
    showSleepReminder: false
  },

  onLoad(options) {
    console.log('晚安仪式页面加载，options:', options);
    if (options.id) {
      this.setData({ dormitoryId: options.id });
      this.loadCheckinData();
    }
    
    // 获取当前时间
    this.updateTime();
    
    // 每分钟检查一次时间
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 60000);
  },

  onUnload() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },

  // 更新时间
  updateTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const isSleepTime = currentHour >= 23;
    
    this.setData({ 
      currentHour,
      isSleepTime 
    });

    // 如果是睡眠时间且未打卡，显示提醒
    if (isSleepTime && !this.data.hasCheckedIn) {
      this.setData({ showSleepReminder: true });
    }
  },

  // 加载打卡数据
  async loadCheckinData() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getGoodnightCheckin',
        data: {
          dormitoryId: this.data.dormitoryId,
          date: this.getTodayDate()
        }
      });

      console.log('晚安打卡数据:', result);

      if (result.result && result.result.success) {
        const { hasCheckedIn, checkInTime, todayCheckins, totalCount, checkedInCount } = result.result;
        
        this.setData({
          hasCheckedIn,
          checkInTime,
          todayCheckins: todayCheckins || [],
          totalCount,
          checkedInCount
        });
      }
    } catch (error) {
      console.error('加载打卡数据失败:', error);
    }
  },

  // 获取今天日期字符串
  getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 晚安打卡
  async onCheckIn() {
    const { dormitoryId, hasCheckedIn } = this.data;
    
    if (hasCheckedIn) {
      wx.showToast({
        title: '已经打过卡啦',
        icon: 'none'
      });
      return;
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'createGoodnightCheckin',
        data: {
          dormitoryId,
          date: this.getTodayDate()
        }
      });

      console.log('打卡结果:', result);

      if (result.result && result.result.success) {
        wx.showToast({
          title: '晚安打卡成功',
          icon: 'success'
        });
        
        // 刷新数据
        this.loadCheckinData();
        
        // 显示温馨祝福语
        setTimeout(() => {
          this.showBlessing();
        }, 1500);
      }
    } catch (error) {
      console.error('打卡失败:', error);
      wx.showToast({
        title: '打卡失败，请重试',
        icon: 'none'
      });
    }
  },

  // 显示祝福语
  showBlessing() {
    const blessings = [
      '晚安好梦~🌙',
      '愿你有个甜美的梦~💤',
      '明天见~✨',
      '好梦，我的小可爱~💕',
      '睡吧，明天又是美好的一天~🌟'
    ];
    
    const randomBlessing = blessings[Math.floor(Math.random() * blessings.length)];
    
    wx.showModal({
      title: randomBlessing,
      content: '记得盖好被子，不要着凉哦~',
      showCancel: false,
      confirmText: '知道啦'
    });
  },

  // 防沉迷提醒确认
  onSleepReminderConfirm() {
    this.setData({ showSleepReminder: false });
    this.onCheckIn();
  },

  // 再玩一会儿
  onSleepReminderLater() {
    this.setData({ showSleepReminder: false });
    
    // 10 分钟后再次提醒
    setTimeout(() => {
      if (this.data.isSleepTime && !this.data.hasCheckedIn) {
        this.setData({ showSleepReminder: true });
      }
    }, 600000);
  },

  // 查看历史记录
  goToHistory() {
    // TODO: 跳转到历史记录页面
    wx.showToast({
      title: '功能开发中...',
      icon: 'none'
    });
  },

  // 连续打卡天数
  getContinuousDays() {
    // TODO: 计算连续打卡天数
    return 0;
  }
});
