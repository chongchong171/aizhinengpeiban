/**
 * 瓜瓜读给你听页面逻辑
 * @description TTS 朗读功能
 */

Page({
  data: {
    isPlaying: false,
    currentContent: '',
    currentCategory: 'stories',
    speed: 1.0,
    volume: 80,
    customText: '',
    contentList: [
      {
        id: 1,
        icon: '🌙',
        title: '月亮和六便士',
        duration: '15 分钟'
      },
      {
        id: 2,
        icon: '🌸',
        title: '小王子 - 玫瑰篇',
        duration: '10 分钟'
      },
      {
        id: 3,
        icon: '⭐',
        title: '星星的孩子',
        duration: '12 分钟'
      },
      {
        id: 4,
        icon: '🍃',
        title: '春天的故事',
        duration: '8 分钟'
      },
      {
        id: 5,
        icon: '💕',
        title: '温暖的拥抱',
        duration: '6 分钟'
      }
    ]
  },

  togglePlay() {
    const isPlaying = !this.data.isPlaying;
    
    if (isPlaying && !this.data.currentContent) {
      wx.showToast({
        title: '请先选择内容',
        icon: 'none'
      });
      return;
    }

    this.setData({ isPlaying });

    if (isPlaying) {
      // 开始播放（这里调用 TTS API）
      this.startTTS();
    } else {
      // 暂停播放
      this.pauseTTS();
    }
  },

  stopPlay() {
    this.setData({ isPlaying: false });
    // 停止播放
    this.stopTTS();
  },

  selectContent() {
    wx.showActionSheet({
      itemList: this.data.contentList.map(item => item.title),
      success: (res) => {
        const selected = this.data.contentList[res.tapIndex];
        this.setData({
          currentContent: selected.title
        });
      }
    });
  },

  selectContentItem(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      currentContent: item.title,
      isPlaying: true
    });
    this.startTTS();
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category });
    
    // 根据分类加载不同的内容列表（示例）
    if (category === 'articles') {
      this.setData({
        contentList: [
          { id: 6, icon: '📰', title: '每日新闻摘要', duration: '5 分钟' },
          { id: 7, icon: '📖', title: '精选文章', duration: '10 分钟' }
        ]
      });
    } else if (category === 'stories') {
      this.setData({
        contentList: [
          { id: 1, icon: '🌙', title: '月亮和六便士', duration: '15 分钟' },
          { id: 2, icon: '🌸', title: '小王子 - 玫瑰篇', duration: '10 分钟' },
          { id: 3, icon: '⭐', title: '星星的孩子', duration: '12 分钟' },
          { id: 4, icon: '🍃', title: '春天的故事', duration: '8 分钟' },
          { id: 5, icon: '💕', title: '温暖的拥抱', duration: '6 分钟' }
        ]
      });
    } else {
      this.setData({ contentList: [] });
    }
  },

  onCustomInput(e) {
    this.setData({
      customText: e.detail.value
    });
  },

  readCustom() {
    if (!this.data.customText.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    this.setData({
      currentContent: '自定义内容',
      isPlaying: true
    });
    this.startTTS();
  },

  onSpeedChange(e) {
    this.setData({
      speed: e.detail.value
    });
  },

  onVolumeChange(e) {
    this.setData({
      volume: e.detail.value
    });
  },

  // TTS 相关方法（待实现）
  startTTS() {
    console.log('开始 TTS 朗读，内容:', this.data.currentContent);
    // TODO: 调用 TTS API
  },

  pauseTTS() {
    console.log('暂停 TTS 朗读');
    // TODO: 暂停 TTS
  },

  stopTTS() {
    console.log('停止 TTS 朗读');
    // TODO: 停止 TTS
  }
});
