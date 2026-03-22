// pages/dormitory/index/index.js
// 引入工具类
const { showError, handleCloudError, showSuccess } = require('../../../utils/error-handler.js');
const { showLoading, hideLoading } = require('../../../utils/loading.js');

Page({
  data: {
    dormitoryId: '',
    dormitory: null,
    memberInfo: null,
    allMembers: [],  // 所有舍友（包含心情）
    recentPosts: [],
    todayTasks: [],
    currentHour: 0
  },

  onLoad(options) {
    console.log('宿舍首页加载，options:', options);
    
    if (options.id) {
      // 有指定宿舍 ID，直接加载
      this.setData({ dormitoryId: options.id });
      this.loadDormitoryData();
    } else {
      // 没有 ID，自动查询用户所在的宿舍
      this.loadUserDormitory();
    }
    
    // 获取当前小时用于防沉迷判断
    const now = new Date();
    this.setData({ currentHour: now.getHours() });
    
    // 检查是否需要防沉迷提醒
    this.checkAntiAddiction();
  },

  onShow() {
    // 页面显示时刷新数据
    if (this.data.dormitoryId) {
      this.loadDormitoryData();
    }
  },

  // 查询用户所在的宿舍
  async loadUserDormitory() {
    showLoading('查询中...');
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'getDormitoryHome',
        data: {}  // 不传 ID，云函数会自动查询
      });

      console.log('查询用户宿舍结果:', result);

      if (result.result && result.result.success) {
        if (result.result.dormitoryId) {
          // 已加入宿舍，加载数据
          this.setData({ dormitoryId: result.result.dormitoryId });
          this.loadDormitoryData();
        } else {
          // 未加入宿舍，显示创建入口（页面已有空状态）
          console.log('用户未加入宿舍');
        }
      } else {
        // 云函数返回失败
        showError(result.result?.message || '查询失败', '查询宿舍');
      }
    } catch (error) {
      console.error('查询宿舍失败:', error);
      handleCloudError(error, 'getDormitoryHome');
      // 失败时显示创建入口
    } finally {
      hideLoading();
    }
  },

  // 加载宿舍数据
  async loadDormitoryData() {
    showLoading('加载中...');
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'getDormitoryHome',
        data: {
          dormitoryId: this.data.dormitoryId
        }
      });

      console.log('宿舍首页数据:', result);

      if (result.result && result.result.success) {
        const { dormitory, memberInfo, allMembers, recentPosts, todayTasks } = result.result;
        
        this.setData({
          dormitory,
          memberInfo: memberInfo || null,
          allMembers: allMembers || [],
          recentPosts: recentPosts || [],
          todayTasks: todayTasks || []
        });

        // 更新活跃天数
        this.updateActiveDays();

        // 更新防沉迷状态
        const now = new Date();
        const currentHour = now.getHours();
        this.setData({ currentHour });
        this.checkAntiAddiction();
        
        // 检查是否有纪念日提醒
        this.checkAnniversary(dormitory);
      } else {
        showError(result.result?.message || '加载宿舍数据失败', '加载宿舍');
      }
    } catch (error) {
      console.error('加载宿舍数据失败:', error);
      handleCloudError(error, 'getDormitoryHome');
    } finally {
      hideLoading();
    }
  },

  // 更新活跃天数
  async updateActiveDays() {
    try {
      await wx.cloud.callFunction({
        name: 'updateActiveDays',
        data: {
          dormitoryId: this.data.dormitoryId
        }
      });
    } catch (error) {
      console.error('更新活跃天数失败:', error);
    }
  },

  // 检查纪念日
  checkAnniversary(dormitory) {
    if (!dormitory || !dormitory.anniversaryInfo) return;
    
    const { milestone, message } = dormitory.anniversaryInfo;
    
    if (milestone && message) {
      wx.showModal({
        title: '🎉 宿舍纪念日',
        content: message,
        showCancel: false,
        confirmText: '好开心'
      });
    }
  },

  // 编辑称呼
  editTitle() {
    const currentTitle = this.data.memberInfo.customTitle || this.data.memberInfo.title;
    
    wx.showModal({
      title: '修改称呼',
      editable: true,
      placeholderText: '输入自定义称呼（留空使用默认）',
      content: `当前称呼：${currentTitle}`,
      success: (res) => {
        if (res.confirm && res.content) {
          this.updateCustomTitle(res.content);
        }
      }
    });
  },

  // 更新自定义称呼
  async updateCustomTitle(customTitle) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'updateMemberTitle',
        data: {
          memberId: this.data.memberInfo._id,
          customTitle: customTitle.trim()
        }
      });

      if (result.result && result.result.success) {
        wx.showToast({
          title: '称呼已更新',
          icon: 'success'
        });
        
        // 更新本地数据
        this.setData({
          'memberInfo.customTitle': customTitle.trim()
        });
      } else {
        throw new Error(result.result?.message || '更新失败');
      }
    } catch (error) {
      console.error('更新称呼失败:', error);
      wx.showToast({
        title: error.message || '更新失败',
        icon: 'none'
      });
    }
  },

  // 格式化日期
  formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 防沉迷检查
  checkAntiAddiction() {
    const { currentHour } = this.data;
    
    if (currentHour >= 23) {
      wx.showModal({
        title: '该睡觉啦',
        content: '已经 23 点啦，早点休息哦~明天再聊！',
        confirmText: '知道啦',
        showCancel: false
      });
    }
  },

  // 跳转到宿舍空间
  goToSpace() {
    wx.navigateTo({
      url: `/pages/dormitory/space/space?id=${this.data.dormitoryId}`
    });
  },

  // 跳转到晚安仪式
  goToGoodnight() {
    wx.navigateTo({
      url: `/pages/dormitory/goodnight/goodnight?id=${this.data.dormitoryId}`
    });
  },

  // 跳转到创建宿舍页面
  goToCreate() {
    wx.navigateTo({
      url: '/pages/dormitory/create/index'
    });
  },

  // 跳转到邀请页面
  goToInvite() {
    wx.navigateTo({
      url: `/pages/dormitory/invite/invite?id=${this.data.dormitoryId}`
    });
  },

  // 跳转到宿舍装修页面
  goToDormitoryRoom() {
    wx.navigateTo({
      url: `/pages/dormitoryRoom/dormitoryRoom?dormId=${this.data.dormitoryId}`
    });
  },

  // 跳转到装饰商城
  goToDecorationShop() {
    wx.navigateTo({
      url: '/pages/decorationShop/decorationShop'
    });
  },

  // 跳转到装修排行榜
  goToRanking() {
    wx.navigateTo({
      url: '/pages/decorationRanking/decorationRanking'
    });
  },

  // 跳转到我的装饰（背包）
  goToMyDecorations() {
    wx.navigateTo({
      url: '/pages/myDecorations/myDecorations'
    });
  },

  // 完成任务
  async completeTask(e) {
    const { taskId } = e.currentTarget.dataset;
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'completeTask',
        data: {
          dormitoryId: this.data.dormitoryId,
          taskId
        }
      });

      if (result.result && result.result.success) {
        wx.showToast({
          title: '任务完成',
          icon: 'success'
        });
        
        // 刷新任务列表
        this.loadDormitoryData();
      }
    } catch (error) {
      console.error('完成任务失败:', error);
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadDormitoryData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 查看舍友详情
  viewMemberProfile(e) {
    const { member } = e.currentTarget.dataset;
    wx.showToast({
      title: `${member.customTitle || member.title || member.name} 的主页`,
      icon: 'none'
    });
    // TODO: 跳转到舍友个人主页
  },

  // 为舍友设置心情（仅自己）
  setMoodFor(e) {
    const { memberId } = e.currentTarget.dataset;
    
    // 只能设置自己的心情
    if (memberId !== this.data.memberInfo._id) {
      wx.showToast({
        title: '只能设置自己的心情哦~',
        icon: 'none'
      });
      return;
    }
    
    this.showMoodSelector();
  },

  // 显示心情选择器
  showMoodSelector() {
    const moodOptions = [
      { value: 'happy', emoji: '😊', label: '开心' },
      { value: 'normal', emoji: '😐', label: '一般' },
      { value: 'sad', emoji: '😔', label: '难过' },
      { value: 'sleepy', emoji: '🌙', label: '困了' },
      { value: 'excited', emoji: '🤩', label: '兴奋' },
      { value: 'tired', emoji: '😫', label: '累了' }
    ];

    wx.showActionSheet({
      itemList: moodOptions.map(m => m.label),
      success: (res) => {
        const selected = moodOptions[res.tapIndex];
        this.updateMood(selected.value, selected.emoji);
      }
    });
  },

  // 更新心情
  async updateMood(mood, moodEmoji) {
    try {
      wx.showLoading({ title: '设置中...' });
      
      const result = await wx.cloud.callFunction({
        name: 'updateMemberMood',
        data: {
          memberId: this.data.memberInfo._id,
          mood: mood,
          moodEmoji: moodEmoji
        }
      });

      if (result.result && result.result.success) {
        wx.showToast({
          title: '心情已更新',
          icon: 'success'
        });
        
        // 刷新数据
        this.loadDormitoryData();
      } else {
        throw new Error(result.result?.message || '更新失败');
      }
    } catch (error) {
      console.error('更新心情失败:', error);
      wx.showToast({
        title: error.message || '更新失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  }
});
