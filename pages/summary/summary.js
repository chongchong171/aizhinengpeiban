/**
 * 今日总结页面逻辑
 * @description 合并心情日记和今日亮点功能
 */

Page({
  data: {
    currentDate: '',
    currentMood: {
      emoji: '😊',
      text: '开心'
    },
    highlights: [
      '完成了一项重要工作',
      '喝了一杯好喝的奶茶',
      '和朋友聊了天'
    ],
    diaryContent: '',
    encouragement: '今天你做得很好！每一个小小的进步都值得被看见。瓜瓜为你骄傲！💕'
  },

  onLoad() {
    // 设置当前日期
    const date = new Date();
    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    this.setData({ currentDate: dateStr });
  },

  onDiaryInput(e) {
    this.setData({
      diaryContent: e.detail.value
    });
  },

  addHighlight() {
    wx.showModal({
      title: '添加亮点',
      placeholderText: '今天有什么值得记录的美好瞬间？',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          const highlights = this.data.highlights;
          highlights.push(res.content);
          this.setData({ highlights });
        }
      }
    });
  },

  saveDiary() {
    if (!this.data.diaryContent.trim()) {
      wx.showToast({
        title: '请先写点什么吧',
        icon: 'none'
      });
      return;
    }

    // 保存日记（这里只是示例，实际应保存到存储或后端）
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });

    // 清空输入
    this.setData({ diaryContent: '' });
  }
});
