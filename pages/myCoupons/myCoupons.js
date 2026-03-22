/**
 * 我的优惠券页面逻辑
 * @description 查看和管理优惠券
 */

Page({
  data: {
    currentTab: 'unused',
    coupons: [],
    stats: {
      total: 0,
      unused: 0,
      used: 0,
      expired: 0
    }
  },

  onLoad() {
    this.loadCoupons('unused');
  },

  // 切换选项卡
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.loadCoupons(tab);
  },

  // 加载优惠券
  async loadCoupons(status) {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'getUserCoupons',
        data: {
          status: status
        }
      });
      
      if (result.result && result.result.success) {
        this.setData({
          coupons: result.result.data.coupons,
          stats: result.result.data.stats
        });
      }
    } catch (error) {
      console.error('加载优惠券失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 使用优惠券
  useCoupon(e) {
    const item = e.currentTarget.dataset.item;
    
    wx.showModal({
      title: '使用优惠券',
      content: `确认使用¥${item.couponValue}优惠券？（满¥${item.minPurchase}可用）`,
      confirmText: '确认使用',
      confirmColor: '#FF6B81',
      success: async (res) => {
        if (res.confirm) {
          await this.doUseCoupon(item.id);
        }
      }
    });
  },

  // 执行使用
  async doUseCoupon(couponId) {
    wx.showLoading({ title: '使用中...' });
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'useCoupon',
        data: {
          couponId: couponId
        }
      });
      
      if (result.result && result.result.success) {
        wx.showToast({
          title: '使用成功',
          icon: 'success'
        });
        
        // 刷新列表
        this.loadCoupons('unused');
        
      } else {
        wx.showToast({
          title: result.result?.message || '使用失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('使用优惠券失败:', error);
      wx.showToast({
        title: '使用失败',
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
