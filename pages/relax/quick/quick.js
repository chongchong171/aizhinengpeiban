/**
 * 快速放松页面逻辑
 * @description 1 分钟应急快速放松，简单深呼吸
 * @author 玄枢
 * @date 2026-03-15
 */

Page({
  /**
   * 页面数据
   */
  data: {
    // 运行状态
    isRunning: false,
    
    // 倒计时
    countdown: 60,
    countdownDisplay: '60',
    
    // 进度
    progress: 0,
    strokeDashoffset: 565, // 2 * PI * 90 ≈ 565
    
    // 呼吸状态
    breathState: '',
    breathIcon: '😌',
    breathInstruction: '准备开始',
    currentStep: 0,
    
    // 进度环颜色
    progressColor: '#E53935',
    
    // 完成显示
    showComplete: false,
    
    // 定时器
    countdownTimer: null,
    breathTimer: null
  },

  /**
   * 页面卸载
   */
  onUnload() {
    this.clearTimers();
  },

  /**
   * 切换开始/暂停
   */
  toggleStart() {
    if (this.data.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  },

  /**
   * 开始快速放松
   */
  start() {
    this.setData({ isRunning: true });
    
    // 启动倒计时
    this.startCountdown();
    
    // 启动呼吸循环
    this.breathCycle();
  },

  /**
   * 暂停
   */
  pause() {
    this.setData({ isRunning: false });
    this.clearTimers();
    
    this.setData({
      breathState: '',
      breathIcon: '⏸️',
      breathInstruction: '已暂停'
    });
  },

  /**
   * 重置
   */
  reset() {
    this.pause();
    this.setData({
      countdown: 60,
      countdownDisplay: '60',
      progress: 0,
      strokeDashoffset: 565,
      breathState: '',
      breathIcon: '😌',
      breathInstruction: '准备开始',
      currentStep: 0,
      showComplete: false
    });
  },

  /**
   * 启动倒计时
   */
  startCountdown() {
    this.clearTimers();
    
    const updateCountdown = () => {
      if (this.data.countdown <= 0) {
        this.complete();
        return;
      }
      
      const newCountdown = this.data.countdown - 1;
      const progress = ((60 - newCountdown) / 60) * 100;
      const strokeDashoffset = 565 - (progress / 100) * 565;
      
      this.setData({
        countdown: newCountdown,
        countdownDisplay: newCountdown.toString(),
        progress: Math.round(progress),
        strokeDashoffset: strokeDashoffset
      });
      
      // 根据剩余时间改变颜色
      if (newCountdown <= 10) {
        this.setData({ progressColor: '#FF5722' });
      } else if (newCountdown <= 30) {
        this.setData({ progressColor: '#FF9800' });
      } else {
        this.setData({ progressColor: '#E53935' });
      }
    };
    
    updateCountdown();
    
    const timer = setInterval(updateCountdown, 1000);
    this.setData({ countdownTimer: timer });
  },

  /**
   * 呼吸循环 (4-2-4 呼吸法)
   */
  breathCycle() {
    if (!this.data.isRunning) return;
    
    // 第 1 步：吸气 4 秒
    this.setData({
      breathState: 'inhale',
      breathIcon: '🌬️',
      breathInstruction: '深吸气...',
      currentStep: 1
    });
    
    const inhaleTimer = setTimeout(() => {
      if (!this.data.isRunning) return;
      
      // 第 2 步：屏息 2 秒
      this.setData({
        breathState: 'hold',
        breathIcon: '😐',
        breathInstruction: '屏住呼吸...',
        currentStep: 2
      });
      
      const holdTimer = setTimeout(() => {
        if (!this.data.isRunning) return;
        
        // 第 3 步：呼气 4 秒
        this.setData({
          breathState: 'exhale',
          breathIcon: '💨',
          breathInstruction: '缓缓呼气...',
          currentStep: 3
        });
        
        const exhaleTimer = setTimeout(() => {
          if (this.data.isRunning) {
            this.breathCycle();
          }
        }, 4000);
        
        this.setData({ breathTimer: exhaleTimer });
      }, 2000);
      
      this.setData({ breathTimer: holdTimer });
    }, 4000);
    
    this.setData({ breathTimer: inhaleTimer });
  },

  /**
   * 完成
   */
  complete() {
    this.pause();
    this.setData({
      showComplete: true,
      breathState: '',
      breathIcon: '🎉',
      breathInstruction: '完成！'
    });
    
    // 震动反馈
    wx.vibrateShort({
      type: 'success'
    });
  },

  /**
   * 关闭完成弹窗
   */
  closeComplete() {
    this.setData({ showComplete: false });
  },

  /**
   * 清理定时器
   */
  clearTimers() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({ countdownTimer: null });
    }
    
    if (this.data.breathTimer) {
      clearTimeout(this.data.breathTimer);
      this.setData({ breathTimer: null });
    }
  }
});
