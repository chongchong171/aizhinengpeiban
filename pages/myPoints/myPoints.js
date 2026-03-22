/**
 * 我的积分页面逻辑
 * @description 查看积分和等级信息
 */

Page({
  data: {
    points: {
      starlight: 0,
      crystal: 0,
      totalStarlight: 0,
      totalCrystal: 0
    },
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    expPercent: 0
  },

  onLoad() {
    this.loadPointsInfo();
  },

  onShow() {
    // 重新加载积分（可能刚刚完成任务）
    this.loadPointsInfo();
  },

  // 加载积分信息
  async loadPointsInfo() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const tasksResult = await wx.cloud.callFunction({
        name: 'getDailyTasks'
      });
      
      if (tasksResult.result && tasksResult.result.success) {
        const userPoints = tasksResult.result.data.userPoints;
        
        // 获取用户详细信息（包含经验值和等级）
        const userResult = await wx.cloud.callFunction({
          name: 'getDormitoryHome'
        });
        
        let exp = 0;
        let level = 1;
        
        if (userResult.result && userResult.result.memberInfo) {
          exp = userResult.result.memberInfo.personalExp || 0;
          level = userResult.result.memberInfo.level || 1;
        }
        
        const nextLevelExp = level * 100;
        const currentLevelExp = (level - 1) * 100;
        const expProgress = exp - currentLevelExp;
        const expPercent = Math.min(100, (expProgress / 100) * 100);
        
        this.setData({
          points: {
            starlight: userPoints.starlight || 0,
            crystal: userPoints.crystal || 0,
            totalStarlight: 0, // TODO: 从数据库获取
            totalCrystal: 0
          },
          level: level,
          exp: exp,
          nextLevelExp: nextLevelExp,
          expPercent: expPercent
        });
      }
    } catch (error) {
      console.error('加载积分信息失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 跳转到积分商城
  goToPointsShop() {
    wx.navigateTo({
      url: '/pages/pointsShop/pointsShop'
    });
  }
});
