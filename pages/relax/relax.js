/**
 * 放松引导页面逻辑 - 主入口
 * @description 放松练习导航页
 * @author 玄枢
 * @date 2026-03-15
 */

Page({
  /**
   * 页面数据
   */
  data: {
    // 页面数据（如有需要可添加）
  },

  /**
   * 页面加载
   */
  onLoad() {
    console.log('放松引导页面加载');
  },

  /**
   * 导航到子页面
   */
  navigateTo(e) {
    const page = e.currentTarget.dataset.page;
    
    if (page) {
      wx.navigateTo({
        url: page,
        success: () => {
          console.log('导航到:', page);
        },
        fail: (err) => {
          console.error('导航失败:', err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    }
  }
});
