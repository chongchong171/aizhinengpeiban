// pages/decorationRanking/decorationRanking.js

Page({
  data: {
    // 排行榜前三
    topRanking: [],
    
    // 我的排名
    myRanking: {
      rank: 0,
      score: 0
    },
    
    // 排行榜列表
    rankingList: [],
    
    // 分页
    page: 1,
    pageSize: 20,
    hasMore: true,
    
    // 弹窗
    showPreview: false,
    selectedDorm: null
  },

  onLoad() {
    this.loadRanking();
    this.loadMyRanking();
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadMore();
    }
  },

  onPullDownRefresh() {
    this.loadRanking();
    this.loadMyRanking();
  },

  // 加载排行榜
  async loadRanking() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      // TODO: 调用云函数获取排行榜
      // 模拟数据
      const mockRanking = this.generateMockRanking();
      
      this.setData({
        topRanking: mockRanking.slice(0, 3),
        rankingList: mockRanking.slice(0, this.data.pageSize),
        hasMore: mockRanking.length > this.data.pageSize
      });
    } catch (error) {
      console.error('加载排行榜失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 加载我的排名
  async loadMyRanking() {
    try {
      // TODO: 调用云函数获取我的排名
      // 模拟数据
      const mockMyRank = {
        rank: 156,
        score: 680
      };
      
      this.setData({ myRanking: mockMyRank });
    } catch (error) {
      console.error('加载我的排名失败:', error);
    }
  },

  // 生成模拟排行榜数据
  generateMockRanking() {
    const names = ['女王大人', '小仙女', '甜心公主', '阳光女孩', '梦幻少女', '樱花妹子', '星辰大海', '月光女神'];
    const dormNames = ['温馨小窝', '梦幻城堡', '粉色天堂', '阳光小屋', '星辰宿舍', '月光雅居', '樱花小筑', '甜蜜家园'];
    
    const ranking = [];
    for (let i = 0; i < 100; i++) {
      ranking.push({
        rank: i + 1,
        dormitoryId: `dorm_${i + 1}`,
        name: names[i % names.length],
        avatar: `/images/avatar${(i % 8) + 1}.png`,
        dormName: dormNames[i % dormNames.length],
        score: 1000 - i * 3,
        previewImages: [
          '/assets/decorations/bed_pink.png',
          '/assets/decorations/desk.png',
          '/assets/decorations/plant.png'
        ],
        previewImage: '/assets/decorations/room_preview.png',
        level: Math.floor((1000 - i * 3) / 100)
      });
    }
    return ranking;
  },

  // 加载更多
  loadMore() {
    const { page, pageSize, rankingList } = this.data;
    const nextPage = page + 1;
    const start = (nextPage - 1) * pageSize;
    const end = nextPage * pageSize;
    
    // TODO: 调用云函数加载更多
    // 模拟加载
    const mockRanking = this.generateMockRanking();
    const newItems = mockRanking.slice(start, end);
    
    if (newItems.length > 0) {
      this.setData({
        rankingList: [...rankingList, ...newItems],
        page: nextPage,
        hasMore: end < mockRanking.length
      });
    } else {
      this.setData({ hasMore: false });
    }
  },

  // 查看我的宿舍
  viewMyDormitory() {
    // TODO: 跳转到我的宿舍页面
    wx.navigateTo({
      url: '/pages/dormitory/index/index'
    });
  },

  // 查看宿舍
  viewDormitory(e) {
    const dormitoryId = e.currentTarget.dataset.id;
    const dorm = this.data.rankingList.find(item => item.dormitoryId === dormitoryId);
    
    if (dorm) {
      this.setData({
        selectedDorm: dorm,
        showPreview: true
      });
    }
  },

  // 关闭预览
  closePreview() {
    this.setData({
      showPreview: false,
      selectedDorm: null
    });
  },

  // 参观宿舍
  visitDormitory() {
    const { selectedDorm } = this.data;
    if (selectedDorm) {
      // TODO: 跳转到宿舍参观页面
      wx.navigateTo({
        url: `/pages/dormitoryRoom/dormitoryRoom?dormId=${selectedDorm.dormitoryId}&mode=visit`
      });
      this.closePreview();
    }
  }
});
