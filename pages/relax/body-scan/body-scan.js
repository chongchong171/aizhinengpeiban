/**
 * 身体扫描页面逻辑
 * @description TTS 引导放松身体各部位，配合轻柔音乐
 * @author 玄枢
 * @date 2026-03-15
 */

Page({
  /**
   * 页面数据
   */
  data: {
    // 播放状态
    isPlaying: false,
    
    // 当前部位
    currentPartIndex: 0,
    currentPartName: '',
    currentPartIcon: '',
    currentInstruction: '',
    
    // 进度
    progress: 0,
    
    // 身体部位列表
    bodyParts: [
      { name: '头顶', icon: '👤', instruction: '感受头顶的放松，想象一股暖流从头顶流下' },
      { name: '额头', icon: '🤔', instruction: '放松额头，舒展眉头，释放所有紧张' },
      { name: '眼睛', icon: '👁️', instruction: '轻轻闭上眼睛，让眼部肌肉完全放松' },
      { name: '脸颊', icon: '😊', instruction: '放松脸颊，嘴角微微上扬' },
      { name: '下巴', icon: '👄', instruction: '放松下巴，让嘴巴微微张开' },
      { name: '颈部', icon: '🦒', instruction: '放松颈部，感受头部的重量' },
      { name: '肩膀', icon: '💪', instruction: '放松肩膀，让肩膀自然下沉' },
      { name: '手臂', icon: '💪', instruction: '放松双臂，感受手臂的沉重感' },
      { name: '手掌', icon: '✋', instruction: '放松手掌，手指自然舒展' },
      { name: '胸部', icon: '❤️', instruction: '放松胸部，深呼吸，感受气息流动' },
      { name: '腹部', icon: '🤰', instruction: '放松腹部，让腹部柔软放松' },
      { name: '背部', icon: '🧘', instruction: '放松背部，感受脊柱的伸展' },
      { name: '臀部', icon: '🍑', instruction: '放松臀部，感受身体的支撑' },
      { name: '大腿', icon: '🦵', instruction: '放松大腿，感受腿部的沉重' },
      { name: '小腿', icon: '🦵', instruction: '放松小腿，释放所有紧张' },
      { name: '脚踝', icon: '🦶', instruction: '放松脚踝，感受脚踝的灵活' },
      { name: '脚掌', icon: '👣', instruction: '放松脚掌，脚趾自然舒展' }
    ],
    
    // TTS 引导词
    ttsScripts: [
      '现在，让我们一起放松头顶。感受一股温暖的能量从头顶流下，带走所有的紧张和疲劳。',
      '放松你的额头。舒展眉头，想象额头像熨斗熨过一样平滑。释放所有让你皱眉的事情。',
      '放松你的眼睛。轻轻闭上眼睛，让眼球自然下沉。感受眼周的肌肉完全放松。',
      '放松你的脸颊。让脸颊的肌肉松软下来，嘴角可以微微上扬，露出轻松的微笑。',
      '放松你的下巴。让下巴自然下垂，嘴巴微微张开。释放咬紧牙关的力量。',
      '放松你的颈部。感受头部的重量，让颈部肌肉完全松弛。想象颈部变得柔软。',
      '放松你的肩膀。让肩膀自然下沉，远离耳朵。感受肩膀的沉重和放松。',
      '放松你的双臂。感受手臂的重量，让手臂自然垂下。从肩膀到指尖都完全放松。',
      '放松你的手掌。感受手掌的温暖，手指自然舒展。让所有紧张从指尖流走。',
      '放松你的胸部。深呼吸，感受气息在胸腔中流动。让胸部变得开阔舒畅。',
      '放松你的腹部。让腹部变得柔软，像棉花一样。感受呼吸时腹部的起伏。',
      '放松你的背部。感受脊柱一节一节地伸展。让背部完全贴合支撑面。',
      '放松你的臀部。感受臀部的重量，完全交给椅子或床面。让臀部彻底放松。',
      '放松你的大腿。感受大腿的沉重感，让大腿肌肉完全松弛。',
      '放松你的小腿。感受小腿的放松，从膝盖到脚踝都变得松软。',
      '放松你的脚踝。感受脚踝的灵活，想象脚踝在轻轻转动。',
      '放松你的脚掌。感受脚掌的温暖，脚趾自然舒展。恭喜你完成了全身放松！'
    ],
    
    // 背景音
    bgmEnabled: true,
    bgmAudio: null,
    
    // TTS
    ttsEnabled: true,
    
    // 定时关闭
    timerOptions: ['关闭', '10 分钟', '20 分钟', '30 分钟', '45 分钟'],
    timerIndex: 0,
    timerInterval: null,
    showTimer: false,
    timerDisplay: '00:00',
    timerSeconds: 0
  },

  /**
   * 页面加载
   */
  onLoad() {
    // 初始化第一个部位
    this.updateCurrentPart(0);
    
    // 创建音频上下文
    this.bgmAudio = wx.createInnerAudioContext();
    this.bgmAudio.loop = true;
    this.bgmAudio.autoplay = false;
    this.bgmAudio.src = '/audio/relax_music.mp3';
  },

  /**
   * 页面卸载
   */
  onUnload() {
    this.clearTimer();
    if (this.bgmAudio) {
      this.bgmAudio.destroy();
    }
  },

  /**
   * 更新当前部位
   */
  updateCurrentPart(index) {
    const part = this.data.bodyParts[index];
    const progress = ((index + 1) / this.data.bodyParts.length) * 100;
    
    this.setData({
      currentPartIndex: index,
      currentPartName: part.name,
      currentPartIcon: part.icon,
      currentInstruction: part.instruction,
      progress: progress
    });
  },

  /**
   * 切换播放状态
   */
  togglePlay() {
    if (this.data.isPlaying) {
      this.pause();
    } else {
      this.start();
    }
  },

  /**
   * 开始身体扫描
   */
  start() {
    this.setData({ isPlaying: true });
    
    // 播放背景音乐
    if (this.data.bgmEnabled) {
      this.bgmAudio.play().catch(err => {
        console.error('播放背景音乐失败:', err);
      });
    }
    
    // 开始引导
    this.playCurrentPart();
    
    // 启动定时关闭
    if (this.data.timerIndex > 0) {
      this.startAutoClose();
    }
  },

  /**
   * 播放当前部位引导
   */
  playCurrentPart() {
    if (!this.data.isPlaying) return;
    
    const index = this.data.currentPartIndex;
    
    // TTS 引导
    if (this.data.ttsEnabled && this.data.ttsScripts[index]) {
      this.playTTS(this.data.ttsScripts[index]);
    }
    
    // 每个部位停留 15 秒
    setTimeout(() => {
      if (!this.data.isPlaying) return;
      
      // 移动到下一个部位
      if (index < this.data.bodyParts.length - 1) {
        const nextIndex = index + 1;
        this.updateCurrentPart(nextIndex);
        this.playCurrentPart();
      } else {
        // 完成全部部位
        this.complete();
      }
    }, 15000);
  },

  /**
   * 暂停
   */
  pause() {
    this.setData({ isPlaying: false });
    
    // 暂停背景音乐
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  },

  /**
   * 重置
   */
  reset() {
    this.pause();
    this.updateCurrentPart(0);
    this.clearTimer();
    this.setData({
      showTimer: false,
      timerDisplay: '00:00'
    });
  },

  /**
   * 完成
   */
  complete() {
    this.pause();
    this.setData({
      currentPartName: '完成',
      currentPartIcon: '🎉',
      currentInstruction: '恭喜您完成了全身放松练习！'
    });
    
    // TTS 完成提示
    if (this.data.ttsEnabled) {
      this.playTTS('恭喜您完成了全身放松练习。感觉怎么样？希望您感到轻松和舒适。');
    }
    
    wx.showToast({
      title: '完成全身放松！',
      icon: 'success',
      duration: 2000
    });
    
    // 渐出背景音乐
    setTimeout(() => {
      if (this.bgmAudio) {
        this.bgmAudio.stop();
      }
    }, 5000);
  },

  /**
   * 跳转到指定部位
   */
  jumpToPart(e) {
    const index = e.currentTarget.dataset.index;
    this.updateCurrentPart(index);
    
    // 如果正在播放，从新位置继续
    if (this.data.isPlaying) {
      this.playCurrentPart();
    }
    
    wx.showToast({
      title: `已跳转到${this.data.bodyParts[index].name}`,
      icon: 'none'
    });
  },

  /**
   * 播放 TTS（占位）
   */
  playTTS(text) {
    console.log('[TTS] 播放:', text);
    
    // TODO: 对接 TTS 服务
    // 可以使用微信同声传译插件或第三方 TTS API
  },

  /**
   * 背景音乐开关
   */
  onBGMToggle(e) {
    this.setData({ bgmEnabled: e.detail.value });
    
    if (e.detail.value && this.data.isPlaying) {
      this.bgmAudio.play();
    } else {
      this.bgmAudio.pause();
    }
  },

  /**
   * TTS 开关
   */
  onTTSToggle(e) {
    this.setData({ ttsEnabled: e.detail.value });
  },

  /**
   * 定时关闭选择
   */
  onTimerChange(e) {
    const index = e.detail.value;
    this.setData({ timerIndex: index });
    
    if (index > 0) {
      const times = [0, 600, 1200, 1800, 2700];
      this.setData({
        timerSeconds: times[index],
        showTimer: true,
        timerDisplay: this.formatTime(times[index])
      });
    } else {
      this.clearTimer();
      this.setData({ showTimer: false });
    }
  },

  /**
   * 启动自动关闭
   */
  startAutoClose() {
    this.clearTimer();
    
    const times = [0, 600, 1200, 1800, 2700];
    let remaining = times[this.data.timerIndex];
    
    const updateTimer = () => {
      if (remaining <= 0) {
        this.pause();
        this.setData({
          isPlaying: false,
          showTimer: false
        });
        
        wx.showToast({
          title: '定时关闭',
          icon: 'none'
        });
        return;
      }
      
      remaining--;
      this.setData({
        timerDisplay: this.formatTime(remaining),
        timerSeconds: remaining
      });
    };
    
    updateTimer();
    
    const interval = setInterval(updateTimer, 1000);
    this.setData({ timerInterval: interval });
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
  }
});
