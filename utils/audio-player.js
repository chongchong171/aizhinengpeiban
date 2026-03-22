/**
 * 音频播放工具类
 * @description 封装微信小程序音频播放功能
 * @author 玄枢
 * @date 2026-03-15
 */

class AudioPlayer {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSrc = '';
    this.onPlayCallback = null;
    this.onPauseCallback = null;
    this.onStopCallback = null;
    this.onErrorCallback = null;
    this.onEndedCallback = null;
    this.onTimeUpdateCallback = null;
  }

  /**
   * 初始化音频播放器
   */
  init() {
    if (!this.audio) {
      this.audio = wx.createInnerAudioContext();
      
      // 监听播放开始
      this.audio.onPlay(() => {
        console.log('音频开始播放');
        this.isPlaying = true;
        this.isPaused = false;
        if (this.onPlayCallback) {
          this.onPlayCallback();
        }
      });

      // 监听暂停
      this.audio.onPause(() => {
        console.log('音频暂停');
        this.isPaused = true;
        if (this.onPauseCallback) {
          this.onPauseCallback();
        }
      });

      // 监听停止
      this.audio.onStop(() => {
        console.log('音频停止');
        this.reset();
        if (this.onStopCallback) {
          this.onStopCallback();
        }
      });

      // 监听播放结束
      this.audio.onEnded(() => {
        console.log('音频播放结束');
        this.reset();
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      });

      // 监听错误
      this.audio.onError((err) => {
        console.error('音频播放错误', err);
        this.reset();
        if (this.onErrorCallback) {
          this.onErrorCallback(err);
        }
      });

      // 监听播放进度
      this.audio.onTimeUpdate(() => {
        if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback({
            currentTime: this.audio.currentTime,
            duration: this.audio.duration
          });
        }
      });
    }
  }

  /**
   * 播放音频
   * @param {string} src - 音频地址
   */
  play(src) {
    this.init();
    
    if (this.isPlaying && this.currentSrc === src && this.isPaused) {
      // 如果是同一个音频且已暂停，继续播放
      this.resume();
      return;
    }
    
    if (this.isPlaying && this.currentSrc !== src) {
      // 如果正在播放其他音频，先停止
      this.stop();
    }
    
    this.currentSrc = src;
    this.audio.src = src;
    this.audio.play();
  }

  /**
   * 暂停播放
   */
  pause() {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
    }
  }

  /**
   * 继续播放
   */
  resume() {
    if (this.audio && this.isPaused) {
      this.audio.resume();
    }
  }

  /**
   * 停止播放
   */
  stop() {
    if (this.audio) {
      this.audio.stop();
    }
  }

  /**
   * 重置播放器状态
   */
  reset() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSrc = '';
  }

  /**
   * 销毁播放器
   */
  destroy() {
    if (this.audio) {
      this.audio.stop();
      this.audio.destroy();
      this.audio = null;
    }
    this.reset();
  }

  /**
   * 设置回调函数
   */
  onPlay(callback) {
    this.onPlayCallback = callback;
  }

  onPause(callback) {
    this.onPauseCallback = callback;
  }

  onStop(callback) {
    this.onStopCallback = callback;
  }

  onError(callback) {
    this.onErrorCallback = callback;
  }

  onEnded(callback) {
    this.onEndedCallback = callback;
  }

  onTimeUpdate(callback) {
    this.onTimeUpdateCallback = callback;
  }

  /**
   * 获取播放器状态
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentTime: this.audio ? this.audio.currentTime : 0,
      duration: this.audio ? this.audio.duration : 0
    };
  }
}

// 导出单例
const audioPlayer = new AudioPlayer();

module.exports = {
  AudioPlayer,
  audioPlayer
};
