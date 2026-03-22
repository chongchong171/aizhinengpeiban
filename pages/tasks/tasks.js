/**
 * 任务页面逻辑
 * @description 查看和完成任务
 */

// 引入工具类
const { showError, handleCloudError, showSuccess } = require('../../utils/error-handler.js');
const { showLoading, hideLoading, showSuccessMessage } = require('../../utils/loading.js');

Page({
  data: {
    userPoints: {
      starlight: 0,
      crystal: 0
    },
    dailyTasks: [],
    weeklyTasks: [],
    dormitoryTasks: []
  },

  onLoad() {
    this.loadTasks();
  },

  onShow() {
    // 重新加载任务和积分
    this.loadTasks();
  },

  // 加载任务列表
  async loadTasks() {
    showLoading('加载中...');
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'getDailyTasks'
      });
      
      if (result.result && result.result.success) {
        this.setData({
          userPoints: result.result.data.userPoints,
          dailyTasks: result.result.data.dailyTasks,
          weeklyTasks: result.result.data.weeklyTasks,
          dormitoryTasks: result.result.data.dormitoryTasks
        });
      } else {
        showError(result.result?.message || '加载任务失败', '加载任务');
      }
    } catch (error) {
      console.error('加载任务失败:', error);
      handleCloudError(error, 'getDailyTasks');
    } finally {
      hideLoading();
    }
  },

  // 领取任务奖励
  async claimReward(e) {
    const item = e.currentTarget.dataset.item;
    
    // 如果已完成，提示
    if (item.completed) {
      wx.showToast({
        title: '奖励已领取',
        icon: 'none'
      });
      return;
    }
    
    // 确认领取
    wx.showModal({
      title: '领取奖励',
      content: `完成任务"${item.taskName}"，获得${item.reward}星光值？`,
      confirmText: '确认领取',
      confirmColor: '#FF6B81',
      success: async (res) => {
        if (res.confirm) {
          await this.doClaimReward(item);
        }
      }
    });
  },

  // 执行领取
  async doClaimReward(item) {
    wx.showLoading({ title: '领取中...' });
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'claimTaskReward',
        data: {
          taskType: item.taskType,
          taskCategory: item.category
        }
      });
      
      if (result.result && result.result.success) {
        wx.showToast({
          title: '领取成功',
          icon: 'success'
        });
        
        // 刷新任务列表和积分
        this.loadTasks();
        
      } else {
        wx.showToast({
          title: result.result?.message || '领取失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('领取奖励失败:', error);
      wx.showToast({
        title: '领取失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  }
});
