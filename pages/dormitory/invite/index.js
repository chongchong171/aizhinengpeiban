// pages/dormitory/invite/index.js
const app = getApp();

Page({
  data: {
    dormitoryId: '',
    dormitoryName: '',
    userInfo: null,
    friendList: [],
    selectedFriends: [],
    inviteMessage: '',
    inviteCard: null,
    inviteRecords: [],
    isGenerating: false,
    currentTime: ''
  },

  onLoad(options) {
    console.log('邀请页面加载，options:', options);
    
    // 获取当前时间
    this.updateCurrentTime();
    
    // 从 options 获取宿舍 ID
    if (options.id) {
      this.setData({ dormitoryId: options.id });
      this.loadDormitoryInfo();
      this.loadInviteRecords();
    }
    
    // 获取用户信息
    this.getUserInfo();
    
    // 加载好友列表（使用微信开放数据域）
    this.loadFriendList();
  },

  onShow() {
    // 页面显示时更新数据
    this.updateCurrentTime();
  },

  /**
   * 更新当前时间显示
   */
  updateCurrentTime() {
    const now = new Date();
    const timeStr = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.setData({ currentTime: timeStr });
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  /**
   * 加载宿舍信息
   */
  async loadDormitoryInfo() {
    try {
      // 从云数据库获取宿舍信息
      const db = wx.cloud.database();
      const result = await db.collection('dormitory').doc(this.data.dormitoryId).get();
      
      if (result.data) {
        this.setData({
          dormitoryName: result.data.name || '我的宿舍'
        });
      }
    } catch (error) {
      console.error('加载宿舍信息失败:', error);
      // 使用默认名称
      this.setData({ dormitoryName: '我的宿舍' });
    }
  },

  /**
   * 加载好友列表（使用微信开放数据域）
   * 注意：微信小程序无法直接获取好友列表，需要通过分享场景或用户授权
   * 这里使用模拟数据展示功能，实际使用时需要配合微信开放标签
   */
  loadFriendList() {
    // 方案 1: 使用微信开放数据域（需要在 app.json 配置）
    // 通过 wx.getFriendCloudStorage 获取好友数据
    
    wx.getFriendCloudStorage({
      keyList: ['dormitoryInvite'],
      success: (res) => {
        console.log('获取好友数据成功:', res);
        if (res.data && res.data.length > 0) {
          const friends = res.data.map(item => ({
            openId: item.openId,
            nickName: item.nickname || '微信用户',
            avatarUrl: item.avatarUrl || '/images/default-avatar.png'
          }));
          this.setData({ friendList: friends });
        }
      },
      fail: (err) => {
        console.log('获取好友数据失败（可能是首次使用）:', err);
        // 使用模拟数据展示功能
        this.loadMockFriends();
      }
    });
  },

  /**
   * 加载模拟好友数据（用于演示）
   */
  loadMockFriends() {
    const mockFriends = [
      { openId: 'mock_1', nickName: '小美', avatarUrl: '/images/avatar1.png' },
      { openId: 'mock_2', nickName: '小雨', avatarUrl: '/images/avatar2.png' },
      { openId: 'mock_3', nickName: '小雅', avatarUrl: '/images/avatar3.png' },
      { openId: 'mock_4', nickName: '小晴', avatarUrl: '/images/avatar4.png' },
      { openId: 'mock_5', nickName: '小雪', avatarUrl: '/images/avatar5.png' },
      { openId: 'mock_6', nickName: '小梦', avatarUrl: '/images/avatar6.png' },
      { openId: 'mock_7', nickName: '小诗', avatarUrl: '/images/avatar7.png' },
      { openId: 'mock_8', nickName: '小画', avatarUrl: '/images/avatar8.png' },
      { openId: 'mock_9', nickName: '小音', avatarUrl: '/images/avatar9.png' },
      { openId: 'mock_10', nickName: '小舞', avatarUrl: '/images/avatar10.png' }
    ];
    
    this.setData({ friendList: mockFriends });
  },

  /**
   * 加载邀请记录
   */
  async loadInviteRecords() {
    try {
      const db = wx.cloud.database();
      const result = await db.collection('dormitoryMember')
        .where({
          dormitoryId: this.data.dormitoryId,
          inviteType: 'invite'
        })
        .orderBy('createTime', 'desc')
        .get();
      
      if (result.data) {
        const records = result.data.map(item => ({
          _id: item._id,
          invitedUserName: item.invitedUserName || '微信用户',
          invitedUserAvatar: item.invitedUserAvatar || '/images/default-avatar.png',
          inviteTimeStr: this.formatTime(item.createTime),
          status: item.status || 'pending'
        }));
        
        this.setData({ inviteRecords: records });
      }
    } catch (error) {
      console.error('加载邀请记录失败:', error);
    }
  },

  /**
   * 格式化时间
   */
  formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    // 一天内显示具体时间
    if (diff < 24 * 60 * 60 * 1000) {
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    
    // 超过一天显示日期
    return `${d.getMonth() + 1}/${d.getDate()}`;
  },

  /**
   * 选择/取消选择好友
   */
  onFriendTap(e) {
    const { openid } = e.currentTarget.dataset;
    const { selectedFriends, friendList } = this.data;
    
    const index = selectedFriends.indexOf(openid);
    if (index > -1) {
      // 取消选择
      selectedFriends.splice(index, 1);
    } else {
      // 选择（最多 5 个）
      if (selectedFriends.length >= 5) {
        wx.showToast({
          title: '最多选择 5 位好友',
          icon: 'none'
        });
        return;
      }
      selectedFriends.push(openid);
    }
    
    this.setData({ selectedFriends });
    
    // 生成邀请卡片预览
    this.generateCardPreview();
  },

  /**
   * 清空选择
   */
  onClearSelection() {
    this.setData({ selectedFriends: [] });
    this.generateCardPreview();
  },

  /**
   * 邀请语输入
   */
  onMessageInput(e) {
    this.setData({ inviteMessage: e.detail.value });
    this.generateCardPreview();
  },

  /**
   * 生成邀请卡片预览
   */
  generateCardPreview() {
    const { selectedFriends, inviteMessage, dormitoryName } = this.data;
    
    if (selectedFriends.length > 0) {
      this.setData({
        inviteCard: {
          title: '宿舍邀请',
          dormitoryName,
          message: inviteMessage || '快来加入我们的宿舍吧~',
          selectedCount: selectedFriends.length
        }
      });
    } else {
      this.setData({ inviteCard: null });
    }
  },

  /**
   * 发送邀请
   */
  async onGenerateCard() {
    const { selectedFriends, dormitoryId, dormitoryName, inviteMessage, isGenerating, userInfo } = this.data;
    
    if (isGenerating) return;
    
    if (selectedFriends.length === 0) {
      wx.showToast({
        title: '请选择要邀请的好友',
        icon: 'none'
      });
      return;
    }

    this.setData({ isGenerating: true });

    try {
      // 获取当前用户信息
      const currentUser = userInfo || {
        nickName: '我',
        avatarUrl: '/images/default-avatar.png'
      };

      // 批量保存邀请记录到 dormitoryMember 集合
      const db = wx.cloud.database();
      const batchPromises = selectedFriends.map(async (friendOpenId) => {
        const friend = this.data.friendList.find(f => f.openId === friendOpenId);
        
        const inviteData = {
          dormitoryId,
          dormitoryName,
          inviterOpenId: currentUser.openId || 'unknown',
          inviterName: currentUser.nickName || '我',
          inviterAvatar: currentUser.avatarUrl || '/images/default-avatar.png',
          invitedUserOpenId: friendOpenId,
          invitedUserName: friend?.nickName || '微信用户',
          invitedUserAvatar: friend?.avatarUrl || '/images/default-avatar.png',
          inviteMessage,
          inviteType: 'invite',
          status: 'pending', // pending, accepted, rejected
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        };

        return db.collection('dormitoryMember').add({
          data: inviteData
        });
      });

      // 等待所有记录保存完成
      await Promise.all(batchPromises);

      console.log('邀请记录保存成功');

      // 发送微信邀请分享
      this.sendWechatInvite();

      wx.showToast({
        title: `已向${selectedFriends.length}位好友发送邀请`,
        icon: 'success'
      });

      // 清空选择
      this.setData({
        selectedFriends: [],
        inviteMessage: '',
        inviteCard: null
      });

      // 刷新邀请记录
      this.loadInviteRecords();

    } catch (error) {
      console.error('发送邀请失败:', error);
      wx.showToast({
        title: error.message || '发送失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ isGenerating: false });
    }
  },

  /**
   * 发送微信邀请分享
   */
  sendWechatInvite() {
    const { dormitoryName, dormitoryId, inviteMessage } = this.data;
    
    // 显示分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
      success: () => {
        console.log('分享菜单已显示');
      }
    });

    // 设置分享内容
    wx.showModal({
      title: '分享邀请',
      content: '点击右上角"..."分享给微信好友或群聊',
      showCancel: false,
      confirmText: '知道啦',
      success: () => {
        // 用户确认后
      }
    });
  },

  /**
   * 分享给好友（自定义分享）
   */
  onShareAppMessage() {
    const { dormitoryName, dormitoryId, inviteMessage, userInfo } = this.data;
    
    return {
      title: `🏠 ${inviteMessage || `邀请你加入${dormitoryName}`}`,
      path: `/pages/dormitory/index/index?id=${dormitoryId}&inviteFrom=${userInfo?.nickName || '我'}`,
      imageUrl: '/images/invite-card.png' // 自定义分享图片
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const { dormitoryName, inviteMessage } = this.data;
    
    return {
      title: `🏠 ${inviteMessage || `邀请你加入${dormitoryName}`}`,
      query: `dormitoryId=${this.data.dormitoryId}`,
      imageUrl: '/images/invite-card.png'
    };
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    Promise.all([
      this.loadDormitoryInfo(),
      this.loadInviteRecords(),
      this.loadFriendList()
    ]).then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
