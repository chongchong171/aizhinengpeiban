/**
 * 朗读功能页面逻辑
 * @description 用户录音功能
 */

Page({
  data: {
    isRecording: false,
    recordingTime: '00:00',
    currentText: '',
    recordings: [
      { id: 1, title: '春晓', date: '2026-03-15 10:30' },
      { id: 2, title: '小王子片段', date: '2026-03-14 20:15' }
    ],
    timer: null,
    seconds: 0
  },

  onLoad() {
    // 检查录音权限
    this.checkPermission();
  },

  onUnload() {
    // 清理定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  checkPermission() {
    wx.authorize({
      scope: 'scope.record',
      fail: () => {
        wx.showModal({
          title: '需要录音权限',
          content: '请在设置中允许录音权限',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting();
            }
          }
        });
      }
    });
  },

  toggleRecording() {
    if (this.data.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  },

  startRecording() {
    this.setData({ isRecording: true, seconds: 0 });
    
    // 开始录音
    wx.startRecord({
      success: (res) => {
        console.log('录音开始', res);
      },
      fail: (err) => {
        console.error('录音失败', err);
        wx.showToast({
          title: '录音失败',
          icon: 'none'
        });
        this.setData({ isRecording: false });
      }
    });

    // 开始计时
    const timer = setInterval(() => {
      this.data.seconds++;
      const minutes = Math.floor(this.data.seconds / 60);
      const seconds = this.data.seconds % 60;
      const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      this.setData({ recordingTime: timeStr });
    }, 1000);

    this.setData({ timer });
  },

  stopRecording() {
    if (!this.data.isRecording) return;

    // 停止录音
    wx.stopRecord({
      success: (res) => {
        console.log('录音完成', res);
        wx.showToast({
          title: '录音完成',
          icon: 'success'
        });

        // 保存录音（示例）
        this.saveRecording(res.tempFilePath);
      },
      fail: (err) => {
        console.error('停止录音失败', err);
      }
    });

    // 清理定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.setData({ timer: null });
    }

    this.setData({ 
      isRecording: false,
      recordingTime: '00:00',
      seconds: 0
    });
  },

  selectContent(e) {
    const type = e.currentTarget.dataset.type;
    
    const contentMap = {
      poem: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
      story: '从前有一只小王子，他住在一个很小的星球上。每天，他都会给他的玫瑰浇水...',
      article: '今天是个好日子，阳光明媚，微风不燥。让我们一起开始新的旅程吧！',
      custom: ''
    };

    if (type === 'custom') {
      wx.showModal({
        title: '自定义内容',
        editable: true,
        placeholderText: '输入你想朗读的内容',
        success: (res) => {
          if (res.confirm && res.content) {
            this.setData({ currentText: res.content });
          }
        }
      });
    } else {
      this.setData({ currentText: contentMap[type] });
    }
  },

  saveRecording(filePath) {
    // 保存录音到列表（示例）
    const recordings = this.data.recordings;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    recordings.unshift({
      id: Date.now(),
      title: `录音 ${recordings.length + 1}`,
      date: dateStr
    });

    this.setData({ recordings });
  },

  playRecording(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '播放录音',
      icon: 'none'
    });
    // TODO: 实现播放功能
  },

  deleteRecording(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条录音吗？',
      success: (res) => {
        if (res.confirm) {
          const recordings = this.data.recordings.filter(item => item.id !== id);
          this.setData({ recordings });
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  }
});
