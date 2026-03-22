// pages/dormitory/space/space.js
const contentFilter = require('../../../utils/contentFilter.js');

Page({
  data: {
    dormitoryId: '',
    posts: [],
    newContent: '',
    isPosting: false,
    hasMore: true,
    page: 1
  },

  onLoad(options) {
    console.log('宿舍空间加载，options:', options);
    if (options.id) {
      this.setData({ dormitoryId: options.id });
      this.loadPosts();
    }
  },

  onShow() {
    // 页面显示时刷新数据
    if (this.data.dormitoryId) {
      this.loadPosts();
    }
  },

  // 加载动态列表
  async loadPosts(refresh = false) {
    const { dormitoryId, page, hasMore } = this.data;
    
    if (!hasMore && !refresh) return;

    try {
      const result = await wx.cloud.callFunction({
        name: 'getDormitoryPosts',
        data: {
          dormitoryId,
          page: refresh ? 1 : page,
          pageSize: 10
        }
      });

      console.log('动态列表:', result);

      if (result.result && result.result.success) {
        const { posts, hasMore: more } = result.result;
        
        if (refresh) {
          this.setData({ posts, page: 1, hasMore: more });
        } else {
          this.setData({ 
            posts: [...this.data.posts, ...posts],
            page: page + 1,
            hasMore: more
          });
        }
      }
    } catch (error) {
      console.error('加载动态失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 内容输入
  onContentInput(e) {
    this.setData({
      newContent: e.detail.value
    });
  },

  // 选择图片（预留功能）
  onChooseImage() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('选择的图片:', res.tempFiles);
        // TODO: 处理图片上传
      }
    });
  },

  // 发布动态
  async onPublish() {
    const { newContent, dormitoryId, isPosting } = this.data;
    
    if (isPosting) return;
    
    if (!newContent.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    // 内容过滤
    const filterResult = contentFilter.checkContent(newContent);
    if (!filterResult.passed) {
      wx.showToast({
        title: filterResult.message,
        icon: 'none'
      });
      return;
    }

    this.setData({ isPosting: true });

    try {
      const result = await wx.cloud.callFunction({
        name: 'createDormitoryPost',
        data: {
          dormitoryId,
          content: newContent.trim(),
          images: [] // TODO: 支持图片
        }
      });

      console.log('发布结果:', result);

      if (result.result && result.result.success) {
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        });
        
        // 清空输入
        this.setData({ newContent: '' });
        
        // 刷新列表
        this.loadPosts(true);
      } else {
        throw new Error(result.result?.message || '发布失败');
      }
    } catch (error) {
      console.error('发布动态失败:', error);
      wx.showToast({
        title: error.message || '发布失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isPosting: false });
    }
  },

  // 点赞
  async onLike(e) {
    const { postId } = e.currentTarget.dataset;
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'likePost',
        data: {
          postId
        }
      });

      if (result.result && result.result.success) {
        // 更新本地数据
        const posts = this.data.posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likeCount: (post.likeCount || 0) + 1,
              isLiked: true
            };
          }
          return post;
        });
        this.setData({ posts });
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  },

  // 温暖互动（拥抱/安慰）
  async onComfort(e) {
    const { postId, type } = e.currentTarget.dataset;
    const comfortType = type === 'hug' ? '🤗 拥抱' : '💕 安慰';
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'comfortPost',
        data: {
          postId,
          type
        }
      });

      if (result.result && result.result.success) {
        wx.showToast({
          title: `已发送${comfortType}`,
          icon: 'success'
        });
        
        // 更新本地数据
        const posts = this.data.posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comfortCount: (post.comfortCount || 0) + 1
            };
          }
          return post;
        });
        this.setData({ posts });
      }
    } catch (error) {
      console.error('互动失败:', error);
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadPosts(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadPosts();
  }
});
