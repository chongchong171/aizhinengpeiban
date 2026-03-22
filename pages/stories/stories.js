/**
 * 睡前故事页面逻辑
 * @description 故事列表展示和播放功能
 * @author 玄枢
 * @date 2026-03-15
 * @note 故事数据待千夜交付，目前使用 placeholder 数据
 * @update 2026-03-15 - 添加动态 AI 名字显示
 * @update 2026-03-15 - 实现音频播放功能
 */

// 引入 AI 名字管理工具
const aiNameUtil = require('../../utils/ai-name.js');
// 引入音频播放工具
const { audioPlayer } = require('../../utils/audio-player.js');

Page({
  /**
   * 页面数据
   */
  data: {
    currentCategory: 'all',     // 当前分类
    stories: [],                // 故事列表
    isPlaying: false,           // 是否正在播放
    isPaused: false,            // 是否暂停
    currentStory: {},           // 当前播放的故事
    showDetail: false,          // 是否显示详情弹窗
    aiName: '瓜瓜',              // AI 名字
    playingProgress: 0,         // 播放进度
    playingDuration: 0          // 总时长
  },

  /**
   * 页面加载
   */
  onLoad() {
    // 获取 AI 名字
    this.loadAiName();
    
    this.loadStories();
    
    // 初始化音频播放器回调
    this.initAudioPlayer();
  },

  /**
   * 初始化音频播放器回调
   */
  initAudioPlayer() {
    audioPlayer.onPlay(() => {
      this.setData({
        isPlaying: true,
        isPaused: false
      });
    });

    audioPlayer.onPause(() => {
      this.setData({
        isPaused: true
      });
    });

    audioPlayer.onStop(() => {
      this.setData({
        isPlaying: false,
        isPaused: false,
        playingProgress: 0,
        playingDuration: 0
      });
    });

    audioPlayer.onEnded(() => {
      this.setData({
        isPlaying: false,
        isPaused: false,
        playingProgress: 0,
        playingDuration: 0
      });
      
      wx.showToast({
        title: '播放完成',
        icon: 'none'
      });
    });

    audioPlayer.onError((err) => {
      console.error('音频播放错误', err);
      this.setData({
        isPlaying: false,
        isPaused: false
      });
      
      wx.showToast({
        title: '播放失败，请重试',
        icon: 'none'
      });
    });

    audioPlayer.onTimeUpdate(({ currentTime, duration }) => {
      this.setData({
        playingProgress: currentTime,
        playingDuration: duration
      });
    });
  },

  /**
   * 加载 AI 名字
   */
  loadAiName() {
    const name = aiNameUtil.getName();
    this.setData({ aiName: name });
  },

  /**
   * 加载故事列表
   * @note 目前使用 placeholder 数据，等待千夜交付真实数据
   */
  loadStories() {
    // Placeholder 故事数据（待替换为千夜交付的数据）
    const placeholderStories = [
      {
        id: 1,
        title: '小兔子的月亮',
        description: '一只小兔子想要摘下月亮送给妈妈，踏上了一场温暖的冒险...',
        duration: 15,
        views: 1234,
        category: 'warm',
        cover: '🌙'
      },
      {
        id: 2,
        title: '星星的约定',
        description: '在遥远的星空里，有一颗专门为好孩子闪烁的星星...',
        duration: 12,
        views: 987,
        category: 'warm',
        cover: '⭐'
      },
      {
        id: 3,
        title: '森林音乐会',
        description: '小动物们举办了一场盛大的音乐会，每个角色都有独特的乐器...',
        duration: 18,
        views: 756,
        category: 'adventure',
        cover: '🎵'
      },
      {
        id: 4,
        title: '云朵枕头',
        description: '睡不着的时候，就想象自己躺在柔软的云朵上...',
        duration: 10,
        views: 2341,
        category: 'bedtime',
        cover: '☁️'
      },
      {
        id: 5,
        title: '彩虹桥的故事',
        description: '雨过天晴后，彩虹桥连接了两个世界...',
        duration: 20,
        views: 1567,
        category: 'adventure',
        cover: '🌈'
      }
    ];

    this.setData({
      stories: placeholderStories
    });
  },

  /**
   * 切换分类
   */
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category });

    // 筛选故事
    if (category === 'all') {
      this.loadStories();
    } else {
      const filtered = this.data.stories.filter(story => story.category === category);
      this.setData({ stories: filtered });
    }
  },

  /**
   * 打开故事详情
   */
  openStory(e) {
    const id = e.currentTarget.dataset.id;
    const story = this.data.stories.find(s => s.id === id);
    
    if (story) {
      this.setData({
        currentStory: story,
        showDetail: true
      });
    }
  },

  /**
   * 关闭详情弹窗
   */
  closeDetail() {
    this.setData({
      showDetail: false
    });
  },

  /**
   * 开始播放故事
   * @note 使用音频播放器实现
   */
  startPlay() {
    const story = this.data.currentStory;
    
    if (!story || !story.audioUrl) {
      // 如果没有音频地址，显示提示（placeholder 数据）
      wx.showToast({
        title: '故事音频待更新~',
        icon: 'none'
      });
      
      this.setData({
        showDetail: false,
        isPlaying: true,
        isPaused: false
      });
      return;
    }
    
    this.setData({
      showDetail: false
    });
    
    // 开始播放音频
    audioPlayer.play(story.audioUrl);
  },

  /**
   * 切换播放/暂停
   */
  togglePlay() {
    if (this.data.isPaused) {
      // 继续播放
      audioPlayer.resume();
    } else {
      // 暂停播放
      audioPlayer.pause();
    }
  },

  /**
   * 停止播放
   */
  stopPlay() {
    audioPlayer.stop();
    
    this.setData({
      isPlaying: false,
      isPaused: false,
      currentStory: {},
      playingProgress: 0,
      playingDuration: 0
    });
  },

  /**
   * 页面卸载时清理播放器
   */
  onUnload() {
    audioPlayer.destroy();
  },
});
