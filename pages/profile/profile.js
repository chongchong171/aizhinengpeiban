/**
 * 个人中心页面逻辑
 * @description 用户信息展示和设置功能
 * @author 玄枢
 * @date 2026-03-15
 * @update 2026-03-15 - 添加动态 AI 名字显示
 */

// 引入 AI 名字管理工具
const aiNameUtil = require('../../utils/ai-name.js');

Page({
  /**
   * 页面数据
   */
  data: {
    stats: {                  // 统计数据
      chatDays: 0,
      chatCount: 0,
      achievements: 0
    },
    dormitoryInfo: null,      // 宿舍信息
    notificationEnabled: true, // 通知开关
    cacheSize: '0 MB',         // 缓存大小
    showAboutDialog: false,    // 关于弹窗
    aiName: '瓜瓜'             // AI 名字
  },

  /**
   * 页面加载
   */
  onLoad() {
    // 获取 AI 名字
    this.loadAiName();
    
    this.loadStats();
    this.calculateCacheSize();
    this.loadDormitoryInfo();
  },

  /**
   * 页面显示
   */
  onShow() {
    // 重新加载宿舍信息（可能刚刚加入）
    this.loadDormitoryInfo();
  },

  /**
   * 加载 AI 名字
   */
  loadAiName() {
    const name = aiNameUtil.getName();
    this.setData({ aiName: name });
  },

  /**
   * 加载宿舍信息
   */
  async loadDormitoryInfo() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getDormitoryHome',
        data: {}
      });

      if (result.result && result.result.success && result.result.dormitoryId) {
        const { dormitory, memberInfo } = result.result;
        
        this.setData({
          dormitoryInfo: {
            id: result.result.dormitoryId,
            name: dormitory.name,
            myTitle: memberInfo ? (memberInfo.customTitle || memberInfo.title) : '',
            activeDays: dormitory.activeDays,
            memberCount: dormitory.memberCount,
            capacity: dormitory.capacity,
            level: dormitory.level
          }
        });
      }
    } catch (error) {
      console.error('加载宿舍信息失败:', error);
      // 不显示错误，静默失败
    }
  },

  /**
   * 跳转到宿舍首页
   */
  goToDormitory() {
    if (this.data.dormitoryInfo && this.data.dormitoryInfo.id) {
      wx.navigateTo({
        url: `/pages/dormitory/index/index?id=${this.data.dormitoryInfo.id}`
      });
    }
  },

  /**
   * 跳转到创建宿舍页面
   */
  goToCreateDormitory() {
    wx.navigateTo({
      url: '/pages/dormitory/create/index'
    });
  },

  /**
   * 加载统计数据
   */
  loadStats() {
    // 从本地存储加载数据
    const chatHistory = wx.getStorageSync('chatHistory') || [];
    const achievements = wx.getStorageSync('achievements') || [];
    
    // 计算陪伴天数（简化版：根据首次聊天记录）
    let chatDays = 0;
    if (chatHistory.length > 0) {
      const firstChat = chatHistory[0];
      const now = Date.now();
      const diff = now - firstChat.timestamp;
      chatDays = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    this.setData({
      stats: {
        chatDays: chatDays,
        chatCount: Math.floor(chatHistory.length / 2), // 除以 2 因为包含用户和 bot 消息
        achievements: achievements.length
      }
    });
  },

  /**
   * 计算缓存大小
   */
  calculateCacheSize() {
    // 获取本地存储信息
    const info = wx.getStorageInfoSync();
    const sizeKB = Math.round(info.currentSize / 1024);
    
    let sizeText = '0 MB';
    if (sizeKB < 1024) {
      sizeText = `${sizeKB} KB`;
    } else {
      sizeText = `${(sizeKB / 1024).toFixed(1)} MB`;
    }
    
    this.setData({ cacheSize: sizeText });
  },

  /**
   * 打开设置页面
   */
  openSetting() {
    wx.openSetting({
      success: (res) => {
        console.log('设置页面打开', res);
      }
    });
  },

  /**
   * 切换通知开关
   */
  toggleNotification() {
    const enabled = !this.data.notificationEnabled;
    this.setData({ notificationEnabled: enabled });
    
    wx.showToast({
      title: enabled ? '已开启通知' : '已关闭通知',
      icon: 'none'
    });
  },

  /**
   * 清除缓存
   */
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？聊天记录和成就将被清空。',
      confirmText: '确定清除',
      confirmColor: '#FF6B81',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          
          this.setData({
            stats: {
              chatDays: 0,
              chatCount: 0,
              achievements: 0
            },
            cacheSize: '0 KB'
          });
          
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 显示关于信息
   */
  showAbout() {
    this.setData({
      showAboutDialog: true
    });
  },

  /**
   * 关闭关于弹窗
   */
  closeAbout() {
    this.setData({
      showAboutDialog: false
    });
  },

  /**
   * 检查更新
   */
  checkUpdate() {
    wx.showToast({
      title: '已是最新版本',
      icon: 'none'
    });
  },

  /**
   * 意见反馈
   */
  giveFeedback() {
    wx.showToast({
      title: '功能开发中...',
      icon: 'none'
    });
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '确定退出',
      confirmColor: '#FF6B81',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          wx.removeStorageSync('userInfo');
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          
          // 返回首页
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            });
          }, 1500);
        }
      }
    });
  }
});
