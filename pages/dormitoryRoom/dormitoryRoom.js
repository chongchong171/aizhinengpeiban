// pages/dormitoryRoom/dormitoryRoom.js

Page({
  data: {
    // 宿舍信息
    dormitory: {
      name: '温馨小窝',
      level: 5,
      score: 850,
      ownerAvatar: '/images/avatar.png',
      ownerName: '女王大人'
    },
    
    // 房间配置
    gridSize: 8, // 8x8 网格
    floorImage: '/assets/decorations/floor_wood.png',
    wallpaperImage: '/assets/decorations/wall_pink.png',
    
    // 网格数据
    gridCells: [],
    
    // 工具状态
    activeTool: 'move', // move, rotate, delete, buy
    
    // 拖拽状态
    draggingDecoration: null,
    dragX: 0,
    dragY: 0,
    selectedGridId: null,
    
    // 装饰品数据
    myDecorations: [],
    selectedDecoration: null,
    
    // 弹窗状态
    showDecorationSelect: false,
    showBuyConfirm: false,
    
    // 提示信息
    toastMessage: ''
  },

  onLoad(options) {
    // 初始化房间
    this.initRoom();
    // 加载用户的装饰品
    this.loadMyDecorations();
  },

  // 初始化房间网格
  initRoom() {
    const cells = [];
    for (let i = 0; i < this.data.gridSize * this.data.gridSize; i++) {
      const row = Math.floor(i / this.data.gridSize);
      const col = i % this.data.gridSize;
      cells.push({
        id: i,
        row: row,
        col: col,
        occupied: false,
        decoration: null,
        selected: false,
        left: 0,
        top: 0,
        rotation: 0
      });
    }
    this.setData({ gridCells: cells });
  },

  // 加载用户的装饰品
  loadMyDecorations() {
    // TODO: 从云数据库加载用户已拥有的装饰品
    // 这里先使用模拟数据
    const mockDecorations = [
      { id: 1, name: '粉色小床', icon: '/assets/decorations/bed_pink.png', type: 'furniture', price: 500 },
      { id: 2, name: '书桌', icon: '/assets/decorations/desk.png', type: 'furniture', price: 300 },
      { id: 3, name: '椅子', icon: '/assets/decorations/chair.png', type: 'furniture', price: 200 },
      { id: 4, name: '书架', icon: '/assets/decorations/bookshelf.png', type: 'furniture', price: 400 },
      { id: 5, name: '小玩偶', icon: '/assets/decorations/doll.png', type: 'decoration', price: 150 },
      { id: 6, name: '绿植', icon: '/assets/decorations/plant.png', type: 'decoration', price: 100 },
      { id: 7, name: '台灯', icon: '/assets/decorations/lamp.png', type: 'decoration', price: 180 },
      { id: 8, name: '地毯', icon: '/assets/decorations/carpet.png', type: 'decoration', price: 250 }
    ];
    
    this.setData({ myDecorations: mockDecorations });
  },

  // 切换工具
  switchTool(e) {
    const tool = e.currentTarget.dataset.tool;
    this.setData({ activeTool: tool });
    this.showToast(`已切换到${this.getToolName(tool)}模式`);
  },

  getToolName(tool) {
    const names = {
      move: '移动',
      rotate: '旋转',
      delete: '删除',
      buy: '购买'
    };
    return names[tool] || '';
  },

  // 点击网格
  onGridTap(e) {
    const gridId = e.currentTarget.dataset.id;
    
    if (this.data.activeTool === 'buy') {
      // 购买模式：打开装饰品选择弹窗
      this.setData({
        selectedGridId: gridId,
        showDecorationSelect: true
      });
    } else if (this.data.activeTool === 'move') {
      // 移动模式：选择装饰品
      const cell = this.data.gridCells.find(c => c.id === gridId);
      if (cell && cell.decoration) {
        this.selectDecoration(gridId);
      }
    }
  },

  // 长按装饰品
  onDecorationLongPress(e) {
    if (this.data.activeTool === 'move') {
      const gridId = e.currentTarget.dataset.gridId;
      this.startDrag(gridId);
    }
  },

  // 点击装饰品
  onDecorationTap(e) {
    const gridId = e.currentTarget.dataset.gridId;
    
    if (this.data.activeTool === 'rotate') {
      this.rotateDecoration(gridId);
    } else if (this.data.activeTool === 'delete') {
      this.deleteDecoration(gridId);
    } else if (this.data.activeTool === 'move') {
      this.selectDecoration(gridId);
    }
  },

  // 选择装饰品
  selectDecoration(gridId) {
    const cells = this.data.gridCells.map(cell => ({
      ...cell,
      selected: cell.id === gridId
    }));
    
    this.setData({
      gridCells: cells,
      selectedGridId: gridId
    });
  },

  // 开始拖拽
  startDrag(gridId) {
    const cell = this.data.gridCells.find(c => c.id === gridId);
    if (cell && cell.decoration) {
      this.setData({
        draggingDecoration: cell.decoration,
        selectedGridId: gridId
      });
    }
  },

  // 旋转装饰品
  rotateDecoration(gridId) {
    const cells = this.data.gridCells.map(cell => {
      if (cell.id === gridId && cell.decoration) {
        const newRotation = (cell.rotation + 90) % 360;
        return { ...cell, rotation: newRotation };
      }
      return cell;
    });
    
    this.setData({ gridCells: cells });
    this.showToast('已旋转 90°');
  },

  // 删除装饰品
  deleteDecoration(gridId) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个装饰品吗？',
      success: (res) => {
        if (res.confirm) {
          const cells = this.data.gridCells.map(cell => {
            if (cell.id === gridId) {
              return {
                ...cell,
                occupied: false,
                decoration: null,
                selected: false
              };
            }
            return cell;
          });
          
          this.setData({ gridCells: cells });
          this.showToast('已删除装饰品');
          // TODO: 保存到数据库
        }
      }
    });
  },

  // 选择装饰品
  selectDecorationFromModal(e) {
    const decId = e.currentTarget.dataset.id;
    const decoration = this.data.myDecorations.find(d => d.id === decId);
    
    this.setData({
      selectedDecoration: decoration,
      showDecorationSelect: false,
      showBuyConfirm: true
    });
  },

  // 关闭装饰品选择弹窗
  closeDecorationSelect() {
    this.setData({ showDecorationSelect: false });
  },

  // 关闭购买确认弹窗
  closeBuyConfirm() {
    this.setData({ showBuyConfirm: false });
  },

  // 确认购买
  confirmBuy() {
    const { selectedDecoration, selectedGridId } = this.data;
    
    if (!selectedDecoration || selectedGridId === null) {
      return;
    }
    
    // TODO: 调用云函数检查积分并购买
    // 模拟购买成功
    const cells = this.data.gridCells.map(cell => {
      if (cell.id === selectedGridId) {
        return {
          ...cell,
          occupied: true,
          decoration: { ...selectedDecoration },
          selected: false
        };
      }
      return cell;
    });
    
    this.setData({
      gridCells: cells,
      showBuyConfirm: false,
      selectedDecoration: null,
      selectedGridId: null
    });
    
    this.showToast('购买成功！');
  },

  // 保存装修
  saveDecoration() {
    // TODO: 调用云函数保存装修配置
    wx.showLoading({ title: '保存中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      this.showToast('装修已保存！');
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1000);
  },

  // 取消操作
  cancelOperation() {
    wx.showModal({
      title: '提示',
      content: '确定要取消吗？未保存的修改将丢失',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  // 显示提示
  showToast(message) {
    this.setData({ toastMessage: message });
    setTimeout(() => {
      this.setData({ toastMessage: '' });
    }, 2000);
  }
});
