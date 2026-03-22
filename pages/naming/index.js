/**
 * AI 命名引导页面逻辑
 * @description 处理用户输入、名字保存和跳转
 * @author 玄枢
 * @date 2026-03-15
 */

Page({
  /**
   * 页面数据
   */
  data: {
    inputName: '',              // 用户输入的名字
    selectedRecommend: '',      // 选中的推荐名字
    canConfirm: false,          // 是否可以确认
    recommendNames: [           // 推荐名字列表
      '小树',
      '念念',
      '陪陪',
      '暖暖',
      '安安',
      '心心',
      '瓜瓜',
      '泡泡'
    ]
  },

  /**
   * 页面加载
   */
  onLoad() {
    console.log('命名页面加载~');
  },

  /**
   * 输入框内容变化处理
   */
  onInputChange(e) {
    const value = e.detail.value.trim();
    
    // 更新输入状态
    this.setData({
      inputName: value,
      selectedRecommend: '',    // 清空推荐选择
      canConfirm: value.length >= 2 && value.length <= 4
    });
  },

  /**
   * 选择推荐名字
   */
  selectRecommend(e) {
    const name = e.currentTarget.dataset.name;
    
    this.setData({
      inputName: name,
      selectedRecommend: name,
      canConfirm: true
    });
  },

  /**
   * 确认名字
   */
  confirmName() {
    const { inputName } = this.data;
    
    // 验证名字
    if (!inputName || inputName.length < 2 || inputName.length > 4) {
      wx.showToast({
        title: '名字长度 2-4 个字哦~',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 保存名字到本地存储
    try {
      wx.setStorageSync('aiName', inputName);
      
      // 显示成功提示
      wx.showModal({
        title: '太好啦！',
        content: `从现在起，我就是${inputName}啦！会一直陪着你哦~ 💕`,
        showCancel: false,
        confirmText: '好耶！',
        confirmColor: '#FF6B81',
        success: (res) => {
          if (res.confirm) {
            // 跳转到首页 - 使用 reLaunch 关闭所有页面打开首页
            wx.reLaunch({
              url: '/pages/index/index',
              fail: (err) => {
                console.error('跳转首页失败:', err);
                wx.showToast({
                  title: '跳转失败，请返回首页~',
                  icon: 'none',
                  duration: 2000
                });
              }
            });
          }
        },
        fail: (err) => {
          console.error('弹窗失败:', err);
          // 弹窗失败也执行跳转
          wx.reLaunch({
            url: '/pages/index/index',
            fail: (err) => {
              console.error('跳转首页失败:', err);
              wx.showToast({
                title: '跳转失败，请返回首页~',
                icon: 'none',
                duration: 2000
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('保存名字失败:', error);
      wx.showToast({
        title: '保存失败，请重试~',
        icon: 'none',
        duration: 2000
      });
    }
  }
});
