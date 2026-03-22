/**
 * 积分商城页面逻辑
 * @description 星光值/晶钻兑换水晶折扣券
 * 根据官方文档：瓜瓜陪伴小程序 - 女生宿舍商业化方案.docx
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
    starlightCoupons: [],  // 星光值折扣券
    crystalCoupons: [],    // 晶钻抵扣券
    rules: {
      monthlyLimit: 2,
      expireDays: 30
    }
  },

  onLoad() {
    this.loadPointsShop();
  },

  onShow() {
    // 重新加载积分（可能刚刚完成任务）
    this.loadUserPoints();
  },

  // 加载积分商城数据
  async loadPointsShop() {
    showLoading('加载中...');
    
    try {
      // 获取商城配置
      const shopResult = await wx.cloud.callFunction({
        name: 'getPointsShop'
      });
      
      if (shopResult.result && shopResult.result.success) {
        // 分类优惠券：星光值和晶钻
        const allCoupons = shopResult.result.data.coupons || [];
        const starlightCoupons = allCoupons.filter(c => c.pointsType === 'starlight');
        const crystalCoupons = allCoupons.filter(c => c.pointsType === 'crystal');
        
        this.setData({
          starlightCoupons: starlightCoupons,
          crystalCoupons: crystalCoupons,
          rules: shopResult.result.data.rules
        });
      } else {
        showError(shopResult.result?.message || '加载商城失败', '加载商城');
      }
      
      // 加载用户积分
      await this.loadUserPoints();
      
    } catch (error) {
      console.error('加载积分商城失败:', error);
      handleCloudError(error, 'getPointsShop');
    } finally {
      hideLoading();
    }
  },

  // 加载用户积分
  async loadUserPoints() {
    try {
      const userResult = await wx.cloud.callFunction({
        name: 'getUserCoupons',
        data: {
          action: 'getPoints'
        }
      });
      
      if (userResult.result && userResult.result.success) {
        this.setData({
          userPoints: userResult.result.data.points
        });
      }
    } catch (error) {
      console.error('加载积分失败:', error);
      // 不显示错误，避免打扰用户
    }
  },
  },

  // 兑换优惠券
  async redeemCoupon(e) {
    const item = e.currentTarget.dataset.item;
    
    // 检查积分是否足够
    if (this.data.userPoints.starlight < item.pointsCost) {
      wx.showModal({
        title: '星光值不足',
        content: `需要${item.pointsCost}星光值，您当前有${this.data.userPoints.starlight}星光值`,
        confirmText: '去赚积分',
        confirmColor: '#FF6B81',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/tasks/tasks'
            });
          }
        }
      });
      return;
    }
    
    // 确认兑换
    wx.showModal({
      title: '确认兑换',
      content: `消耗${item.pointsCost}星光值兑换¥${item.couponValue}优惠券？`,
      confirmText: '确认兑换',
      confirmColor: '#FF6B81',
      success: async (res) => {
        if (res.confirm) {
          await this.doRedeem(item.couponType);
        }
      }
    });
  },

  // 执行兑换
  async doRedeem(couponType) {
    wx.showLoading({ title: '兑换中...' });
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'redeemCoupon',
        data: {
          couponType: couponType
        }
      });
      
      if (result.result && result.result.success) {
        wx.showToast({
          title: '兑换成功',
          icon: 'success'
        });
        
        // 刷新积分
        this.loadUserPoints();
        
        // 提示查看优惠券
        setTimeout(() => {
          wx.showModal({
            title: '兑换成功',
            content: '优惠券已发放到"我的优惠券"，是否立即查看？',
            confirmText: '查看',
            confirmColor: '#FF6B81',
            success: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/myCoupons/myCoupons'
                });
              }
            }
          });
        }, 1000);
        
      } else {
        wx.showToast({
          title: result.result?.message || '兑换失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('兑换失败:', error);
      wx.showToast({
        title: '兑换失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 显示规则
  showRules() {
    wx.showModal({
      title: '兑换规则',
      content: '1. 每人每月最多兑换 2 张优惠券\n2. 优惠券有效期 30 天\n3. 星光值可通过完成每日任务获取\n4. 优惠券不可兑换现金',
      showCancel: false,
      confirmColor: '#FF6B81'
    });
  },

  // 跳转到小红书店铺（客服引导方案）
  jumpToXiaohongshu(e) {
    const { couponId, couponAmount } = e.currentTarget.dataset || {};
    
    wx.showModal({
      title: '🎫 兑换说明',
      content: '请添加客服微信：yg-crystal\n\n1. 发送优惠券编号\n2. 获取兑换码\n3. 客服会引导您在小红书店铺使用',
      confirmText: '复制客服号',
      confirmColor: '#FF69B4',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'yg-crystal',
            success: () => {
              wx.showToast({
                title: '已复制，去微信添加',
                icon: 'success',
                duration: 2000
              });
            }
          });
        }
      }
    });
  }
});
