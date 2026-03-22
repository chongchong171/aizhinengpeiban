/**
 * 想象放松页面逻辑
 * @description 选择场景进行想象放松，配合背景图和背景音
 * @author 玄枢
 * @date 2026-03-15
 */

Page({
  /**
   * 页面数据
   */
  data: {
    // 场景列表
    scenes: [
      {
        id: 'beach',
        name: '🏖️ 海滩',
        emoji: '🏖️',
        description: '躺在温暖的沙滩上，听着海浪声，感受海风拂面',
        gradient: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 50%, #03A9F4 100%)',
        color: '#03A9F4',
        bgm: '/audio/ocean.mp3',
        guide: [
          '找一个舒适的姿势坐下或躺下，轻轻闭上眼睛。',
          '现在，想象自己正躺在一片美丽的海滩上。阳光温暖地洒在你的身上，不冷也不热，刚刚好。',
          '你身下是柔软细腻的沙子，微微温暖。你能感受到沙子的颗粒感，非常舒适。',
          '听，海浪轻轻拍打着海岸。哗...哗...有节奏的海浪声让你感到无比放松。',
          '感受海风轻轻拂过你的脸颊，带来淡淡的海水咸味和清新的空气。',
          '远处，海鸥在天空中自由翱翔。它们的叫声遥远而宁静。',
          '阳光照在你的脸上，温暖而舒适。你的全身都沐浴在温暖的阳光中。',
          '每一次呼吸，都吸入清新的海风。每一次呼气，都释放身体的紧张。',
          '你感到越来越放松，越来越平静。这片海滩只属于你，是你的专属放松空间。',
          '在这里，你可以完全放下所有的烦恼和压力。只有你、大海和天空。',
          '慢慢享受这份宁静和放松。当你准备好了，可以慢慢睁开眼睛。'
        ]
      },
      {
        id: 'forest',
        name: '🌲 森林',
        emoji: '🌲',
        description: '漫步在静谧的森林中，呼吸清新空气，感受自然能量',
        gradient: 'linear-gradient(135deg, #81C784 0%, #4CAF50 50%, #388E3C 100%)',
        color: '#388E3C',
        bgm: '/audio/forest.mp3',
        guide: [
          '找一个舒适的姿势，轻轻闭上眼睛，做几次深呼吸。',
          '现在，想象自己正漫步在一片古老的森林中。四周是高大的树木，阳光透过树叶洒下斑驳的光影。',
          '你脚下是柔软的苔藓和落叶，踩上去非常舒适。空气中弥漫着泥土和植物的清香。',
          '深呼吸...你能闻到森林特有的气息，清新、纯净，充满生命力。',
          '听，鸟儿在枝头欢快地歌唱。它们的歌声清脆悦耳，让你心情愉悦。',
          '微风吹过，树叶沙沙作响。这是大自然最美妙的音乐。',
          '阳光透过树叶的缝隙，在你的脸上投下温暖的光斑。你感到温暖而舒适。',
          '你继续向前走，发现了一片林间空地。空地上开满了野花，五彩斑斓。',
          '你在空地中央坐下，感受大地的支撑。周围的树木像守护者一样环绕着你。',
          '每一次呼吸，都吸入森林的能量。每一次呼气，都释放所有的疲惫。',
          '在这片森林中，你感到完全的安全和放松。让这份宁静充满你的身心。',
          '慢慢享受这份与自然的连接。当你准备好了，可以慢慢睁开眼睛。'
        ]
      },
      {
        id: 'cloud',
        name: '☁️ 云端',
        emoji: '☁️',
        description: '漂浮在柔软的云端，轻盈自在，忘却一切烦恼',
        gradient: 'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 50%, #64B5F6 100%)',
        color: '#64B5F6',
        bgm: '/audio/ambient.mp3',
        guide: [
          '找一个最舒适的姿势躺下，轻轻闭上眼睛。',
          '现在，想象自己正漂浮在一朵巨大的、柔软的云朵上。云朵像棉花糖一样轻柔地托着你。',
          '你感到身体越来越轻，越来越轻。所有的重量都消失了，你变得像羽毛一样轻盈。',
          '云朵缓缓地带着你飘向天空。你越飘越高，地面上的事物变得越来越小。',
          '四周是蔚蓝的天空和朵朵白云。阳光温暖地照耀着你，不刺眼，只有温暖。',
          '你躺在云朵上，感到无比的柔软和舒适。云朵完美地支撑着你的身体。',
          '微风吹拂着你，带来清新的空气。你感到前所未有的轻松和自由。',
          '在这里，没有烦恼，没有压力，没有忧虑。只有你、云朵和蓝天。',
          '你就像天空中的一只鸟儿，自由自在地翱翔。所有的束缚都消失了。',
          '感受这份轻盈，这份自由。让你的心也像云朵一样轻盈飘逸。',
          '慢慢地，云朵带着你缓缓下降。你感到越来越踏实，越来越放松。',
          '当你准备好了，可以慢慢睁开眼睛，带着这份轻松回到现实。'
        ]
      }
    ],
    
    // 当前选择的场景
    selectedScene: null,
    
    // 引导播放状态
    isPlaying: false,
    currentGuideIndex: 0,
    currentGuideText: '',
    guideTimer: null,
    
    // 背景音
    bgmAudio: null,
    isBGMPlaying: false,
    volume: 50,
    bgmSrc: '',
    
    // 定时关闭
    timerMinutes: 0,
    timerInterval: null,
    showTimer: false,
    timerDisplay: '00:00',
    timerSeconds: 0
  },

  /**
   * 页面加载
   */
  onLoad() {
    // 创建音频上下文
    this.bgmAudio = wx.createInnerAudioContext();
    this.bgmAudio.loop = true;
    this.bgmAudio.autoplay = false;
    
    this.bgmAudio.onPlay(() => {
      this.setData({ isBGMPlaying: true });
    });
    
    this.bgmAudio.onPause(() => {
      this.setData({ isBGMPlaying: false });
    });
    
    this.bgmAudio.onEnded(() => {
      this.setData({ isBGMPlaying: false });
    });
  },

  /**
   * 页面卸载
   */
  onUnload() {
    this.clearGuideTimer();
    this.clearTimer();
    if (this.bgmAudio) {
      this.bgmAudio.destroy();
    }
  },

  /**
   * 选择场景
   */
  selectScene(e) {
    const scene = e.currentTarget.dataset.scene;
    
    this.setData({
      selectedScene: scene,
      bgmSrc: scene.bgm,
      currentGuideIndex: 0,
      currentGuideText: scene.guide[0] || ''
    });
    
    // 自动播放背景音
    setTimeout(() => {
      this.playBGM();
    }, 500);
  },

  /**
   * 返回选择
   */
  backToSelect() {
    this.clearGuideTimer();
    this.stopBGM();
    this.clearTimer();
    
    this.setData({
      selectedScene: null,
      isPlaying: false,
      currentGuideIndex: 0,
      currentGuideText: '',
      showTimer: false
    });
  },

  /**
   * 切换引导播放
   */
  toggleGuide() {
    if (this.data.isPlaying) {
      this.pauseGuide();
    } else {
      this.playGuide();
    }
  },

  /**
   * 播放引导
   */
  playGuide() {
    if (!this.data.selectedScene) return;
    
    this.setData({ isPlaying: true });
    this.playCurrentGuide();
  },

  /**
   * 播放当前引导句
   */
  playCurrentGuide() {
    if (!this.data.isPlaying || !this.data.selectedScene) return;
    
    const guide = this.data.selectedScene.guide;
    const index = this.data.currentGuideIndex;
    
    if (index >= guide.length) {
      // 播放完成
      this.completeGuide();
      return;
    }
    
    // 显示当前引导文字
    this.setData({
      currentGuideText: guide[index]
    });
    
    // TTS 播放（占位）
    this.playTTS(guide[index]);
    
    // 每句停留 8 秒
    const timer = setTimeout(() => {
      if (this.data.isPlaying) {
        this.setData({
          currentGuideIndex: this.data.currentGuideIndex + 1
        });
        this.playCurrentGuide();
      }
    }, 8000);
    
    this.setData({ guideTimer: timer });
  },

  /**
   * 暂停引导
   */
  pauseGuide() {
    this.setData({ isPlaying: false });
    this.clearGuideTimer();
  },

  /**
   * 重播引导
   */
  replay() {
    this.clearGuideTimer();
    this.setData({
      currentGuideIndex: 0,
      currentGuideText: this.data.selectedScene.guide[0] || ''
    });
    
    if (this.data.isPlaying) {
      this.playCurrentGuide();
    }
  },

  /**
   * 完成引导
   */
  completeGuide() {
    this.pauseGuide();
    this.setData({
      currentGuideText: '引导结束，继续享受这份宁静吧~',
      isPlaying: false
    });
    
    wx.showToast({
      title: '引导结束',
      icon: 'success'
    });
  },

  /**
   * 清理引导定时器
   */
  clearGuideTimer() {
    if (this.data.guideTimer) {
      clearTimeout(this.data.guideTimer);
      this.setData({ guideTimer: null });
    }
  },

  /**
   * 播放 TTS（占位）
   */
  playTTS(text) {
    console.log('[TTS] 播放:', text);
    // TODO: 对接 TTS 服务
  },

  /**
   * 播放背景音
   */
  playBGM() {
    if (!this.data.bgmSrc) return;
    
    this.bgmAudio.src = this.data.bgmSrc;
    this.bgmAudio.volume = this.data.volume / 100;
    this.bgmAudio.play().catch(err => {
      console.error('播放背景音失败:', err);
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
    this.setData({ isBGMPlaying: false });
  },

  /**
   * 音量调节
   */
  onVolumeChange(e) {
    const volume = e.detail.value;
    this.setData({ volume: volume });
    
    if (this.bgmAudio) {
      this.bgmAudio.volume = volume / 100;
    }
  },

  /**
   * 设置定时关闭
   */
  setTimer(e) {
    const minutes = e.currentTarget.dataset.minutes;
    this.clearTimer();
    
    if (minutes > 0) {
      const seconds = minutes * 60;
      this.setData({
        timerMinutes: minutes,
        timerSeconds: seconds,
        showTimer: true,
        timerDisplay: this.formatTime(seconds)
      });
      
      this.startTimer();
    } else {
      this.setData({
        timerMinutes: 0,
        showTimer: false
      });
    }
  },

  /**
   * 启动定时器
   */
  startTimer() {
    this.clearTimer();
    
    const updateTimer = () => {
      if (this.data.timerSeconds <= 0) {
        this.autoClose();
        return;
      }
      
      this.setData({
        timerSeconds: this.data.timerSeconds - 1,
        timerDisplay: this.formatTime(this.data.timerSeconds)
      });
    };
    
    updateTimer();
    
    const interval = setInterval(updateTimer, 1000);
    this.setData({ timerInterval: interval });
  },

  /**
   * 自动关闭
   */
  autoClose() {
    this.clearTimer();
    this.pauseGuide();
    this.stopBGM();
    
    this.setData({
      showTimer: false,
      isBGMPlaying: false
    });
    
    wx.showToast({
      title: '定时关闭',
      icon: 'none'
    });
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
   * 音频事件
   */
  onBGMPlay() {
    console.log('背景音开始播放');
  },

  onBGMPause() {
    console.log('背景音暂停');
  }
});
