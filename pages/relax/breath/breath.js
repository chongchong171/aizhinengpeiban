/**
 * 呼吸练习页面逻辑
 * @description 动画引导呼吸练习，配合 TTS 语音和背景音
 * @author 玄枢
 * @date 2026-03-15
 */

Page({
  /**
   * 页面数据
   */
  data: {
    // 呼吸状态
    isBreathing: false,
    breathingState: '', // inhale, hold, exhale
    breathingText: '准备开始',
    breathingHint: '跟随节奏深呼吸',
    breathingIcon: '😌',
    currentStep: 0,
    
    // 背景音
    bgmSelected: 'none',
    bgmSrc: '',
    bgmAudio: null,
    
    // TTS
    ttsEnabled: true,
    
    // 倒计时
    showTimer: true,
    timerDisplay: '05:00',
    timerInterval: null,
    remainingSeconds: 300,
    
    // 设置
    durationOptions: ['3 分钟', '5 分钟', '10 分钟', '15 分钟', '20 分钟'],
    durationIndex: 1,
    durationMap: {
      0: 180,
      1: 300,
      2: 600,
      3: 900,
      4: 1200
    },
    
    // 呼吸节奏 (4-7-8 呼吸法)
    breathRhythm: {
      inhale: 4000,   // 吸气 4 秒
      hold: 7000,     // 屏息 7 秒
      exhale: 8000    // 呼气 8 秒
    }
  },

  /**
   * 页面加载
   */
  onLoad() {
    // 创建内部音频上下文
    this.bgmAudio = wx.createInnerAudioContext();
    this.bgmAudio.loop = true;
    this.bgmAudio.autoplay = false;
    
    // 监听音频事件
    this.bgmAudio.onPlay(() => {
      console.log('背景音开始播放');
    });
    
    this.bgmAudio.onPause(() => {
      console.log('背景音暂停');
    });
    
    this.bgmAudio.onEnded(() => {
      console.log('背景音结束');
    });
    
    this.bgmAudio.onError((res) => {
      console.error('背景音播放错误:', res);
    });
  },

  /**
   * 页面卸载时清理
   */
  onUnload() {
    this.clearTimer();
    this.stopBGM();
    if (this.bgmAudio) {
      this.bgmAudio.destroy();
    }
  },

  /**
   * 切换呼吸练习状态
   */
  toggleBreathing() {
    if (this.data.isBreathing) {
      this.pauseBreathing();
    } else {
      this.startBreathing();
    }
  },

  /**
   * 开始呼吸练习
   */
  startBreathing() {
    this.setData({ isBreathing: true });
    
    // 播放背景音
    if (this.data.bgmSelected !== 'none') {
      this.playBGM();
    }
    
    // 启动呼吸引导循环
    this.breathingCycle();
    
    // 启动倒计时
    this.startTimer();
    
    // TTS 引导
    if (this.data.ttsEnabled) {
      this.playTTS('开始呼吸练习，让我们一起放松');
    }
  },

  /**
   * 呼吸循环 (4-7-8 呼吸法)
   */
  breathingCycle() {
    if (!this.data.isBreathing) return;

    // 第 1 步：吸气（4 秒）
    this.setData({
      breathingState: 'inhale',
      breathingText: '吸气',
      breathingHint: '用鼻子深深吸气...4 秒',
      breathingIcon: '🌬️',
      currentStep: 1
    });

    // TTS 引导
    if (this.data.ttsEnabled) {
      this.playTTS('吸气');
    }

    // 4 秒后进入屏息阶段
    setTimeout(() => {
      if (!this.data.isBreathing) return;

      // 第 2 步：屏息（7 秒）
      this.setData({
        breathingState: 'hold',
        breathingText: '屏息',
        breathingHint: '保持呼吸...7 秒',
        breathingIcon: '😐',
        currentStep: 2
      });

      if (this.data.ttsEnabled) {
        // 屏息时不播放 TTS，保持安静
      }

      // 7 秒后进入呼气阶段
      setTimeout(() => {
        if (!this.data.isBreathing) return;

        // 第 3 步：呼气（8 秒）
        this.setData({
          breathingState: 'exhale',
          breathingText: '呼气',
          breathingHint: '用嘴巴缓缓呼气...8 秒',
          breathingIcon: '💨',
          currentStep: 3
        });

        // TTS 引导
        if (this.data.ttsEnabled) {
          this.playTTS('呼气');
        }

        // 8 秒后再次吸气，开始新循环
        setTimeout(() => {
          if (this.data.isBreathing) {
            this.breathingCycle();
          }
        }, this.data.breathRhythm.exhale);
      }, this.data.breathRhythm.hold);
    }, this.data.breathRhythm.inhale);
  },

  /**
   * 暂停呼吸练习
   */
  pauseBreathing() {
    this.setData({
      isBreathing: false,
      breathingState: '',
      breathingText: '已暂停',
      breathingHint: '点击开始继续练习',
      breathingIcon: '⏸️'
    });
    
    // 暂停背景音
    if (this.bgmAudio && this.data.bgmSelected !== 'none') {
      this.bgmAudio.pause();
    }
    
    // 清除定时器（但保留剩余时间）
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval);
      this.setData({ timerInterval: null });
    }
  },

  /**
   * 重置呼吸练习
   */
  resetBreathing() {
    this.pauseBreathing();
    
    const duration = this.data.durationMap[this.data.durationIndex];
    this.setData({
      breathingText: '准备开始',
      breathingHint: '跟随节奏深呼吸',
      breathingIcon: '😌',
      timerDisplay: this.formatTime(duration),
      remainingSeconds: duration,
      currentStep: 0
    });
  },

  /**
   * 选择背景音
   */
  selectBGM(e) {
    const bgm = e.currentTarget.dataset.bgm;
    const wasPlaying = this.data.isBreathing && this.data.bgmSelected !== 'none';
    
    this.setData({ bgmSelected: bgm });
    
    // 更新音频源
    const bgmPaths = {
      none: '',
      rain: '/audio/rain.mp3',
      ocean: '/audio/ocean.mp3',
      forest: '/audio/forest.mp3'
    };
    
    this.setData({ bgmSrc: bgmPaths[bgm] || '' });
    
    // 如果正在播放，切换音频
    if (wasPlaying && bgm !== 'none') {
      this.playBGM();
    } else if (bgm === 'none') {
      this.stopBGM();
    }
    
    wx.showToast({
      title: `已选择${this.getBGMName(bgm)}`,
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * 获取背景音名称
   */
  getBGMName(bgm) {
    const names = {
      none: '关闭',
      rain: '雨声',
      ocean: '海浪',
      forest: '森林'
    };
    return names[bgm] || '未知';
  },

  /**
   * 播放背景音
   */
  playBGM() {
    if (!this.data.bgmSrc) {
      console.warn('没有设置背景音源');
      return;
    }
    
    this.bgmAudio.src = this.data.bgmSrc;
    this.bgmAudio.play().catch(err => {
      console.error('播放背景音失败:', err);
      wx.showToast({
        title: '音频加载失败',
        icon: 'none'
      });
    });
  },

  /**
   * 停止背景音
   */
  stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.stop();
    }
  },

  /**
   * TTS 语音播放（占位函数）
   * 后期对接微信 TTS 或第三方 TTS 服务
   */
  playTTS(text) {
    console.log('[TTS] 播放:', text);
    
    // TODO: 对接微信 TTS 或第三方服务
    // 方案 1: 使用微信同声传译插件
    // 方案 2: 调用阿里云/百度 TTS API
    // 方案 3: 使用预录制的音频文件
    
    // 临时占位：显示 Toast
    // wx.showToast({
    //   title: text,
    //   icon: 'none',
    //   duration: 2000
    // });
  },

  /**
   * 启动倒计时
   */
  startTimer() {
    this.clearTimer();
    
    const updateTimer = () => {
      if (this.data.remainingSeconds <= 0) {
        this.completeSession();
        return;
      }
      
      this.setData({
        timerDisplay: this.formatTime(this.data.remainingSeconds),
        remainingSeconds: this.data.remainingSeconds - 1
      });
    };
    
    updateTimer();
    
    const interval = setInterval(updateTimer, 1000);
    this.setData({ timerInterval: interval });
  },

  /**
   * 增加时间
   */
  addTime(e) {
    const minutes = e.currentTarget.dataset.minutes;
    const newSeconds = this.data.remainingSeconds + (minutes * 60);
    
    this.setData({
      remainingSeconds: newSeconds,
      timerDisplay: this.formatTime(newSeconds)
    });
    
    wx.showToast({
      title: `已增加${minutes}分钟`,
      icon: 'none'
    });
  },

  /**
   * 完成练习
   */
  completeSession() {
    this.clearTimer();
    this.pauseBreathing();
    
    this.setData({
      breathingText: '练习完成！',
      breathingHint: '太棒了！感觉怎么样？',
      breathingIcon: '🎉'
    });
    
    // TTS 完成提示
    if (this.data.ttsEnabled) {
      this.playTTS('恭喜您完成呼吸练习，感觉放松了吗？');
    }
    
    wx.showToast({
      title: '太棒了！完成练习~',
      icon: 'success',
      duration: 2000
    });
    
    // 停止背景音
    setTimeout(() => {
      this.stopBGM();
    }, 3000);
  },

  /**
   * 清理定时器
   */
  clearTimer() {
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval);
      this.setData({ timerInterval: null });
    }
  },

  /**
   * 格式化时间
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * 时长选择变化
   */
  onDurationChange(e) {
    const index = e.detail.value;
    const duration = this.data.durationMap[index];
    
    this.setData({
      durationIndex: index,
      timerDisplay: this.formatTime(duration),
      remainingSeconds: duration
    });
    
    // 如果正在呼吸，重置练习
    if (this.data.isBreathing) {
      this.resetBreathing();
    }
  },

  /**
   * TTS 开关切换
   */
  onTTSToggle(e) {
    this.setData({ ttsEnabled: e.detail.value });
    
    wx.showToast({
      title: e.detail.value ? '已开启语音引导' : '已关闭语音引导',
      icon: 'none'
    });
  },

  /**
   * 音频事件处理
   */
  onBGMPlay() {
    console.log('音频开始播放');
  },

  onBGMPause() {
    console.log('音频暂停');
  },

  onBGMEnded() {
    console.log('音频播放结束');
  }
});
