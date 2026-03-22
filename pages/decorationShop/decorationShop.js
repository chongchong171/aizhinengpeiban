// pages/decorationShop/decorationShop.js

Page({
  data: {
    // 用户积分
    userPoints: {
      starlight: 5000,
      crystal: 100
    },
    
    // 分类数据
    categories: [
      { id: 'furniture', name: '家具', icon: '🪑' },
      { id: 'wallpaper', name: '壁纸', icon: '🎨' },
      { id: 'floor', name: '地板', icon: '🏠' },
      { id: 'decoration', name: '装饰品', icon: '🎀' }
    ],
    activeCategory: 'furniture',
    
    // 商品数据
    products: {
      furniture: [
        { 
          id: 1, 
          name: '粉色小床', 
          icon: '/assets/decorations/bed_pink.png',
          type: 'furniture',
          typeName: '家具',
          level: 1,
          price: 500,
          currency: 'starlight',
          description: '温馨的粉色小床，让美梦相伴',
          scoreBonus: 50,
          isNew: true,
          isHot: true
        },
        { 
          id: 2, 
          name: '书桌', 
          icon: '/assets/decorations/desk.png',
          type: 'furniture',
          typeName: '家具',
          level: 1,
          price: 300,
          currency: 'starlight',
          description: '简洁实用的书桌',
          scoreBonus: 30,
          isNew: false,
          isHot: false
        },
        { 
          id: 3, 
          name: '椅子', 
          icon: '/assets/decorations/chair.png',
          type: 'furniture',
          typeName: '家具',
          level: 1,
          price: 200,
          currency: 'starlight',
          description: '舒适的学习椅',
          scoreBonus: 20,
          isNew: false,
          isHot: false
        },
        { 
          id: 4, 
          name: '书架', 
          icon: '/assets/decorations/bookshelf.png',
          type: 'furniture',
          typeName: '家具',
          level: 2,
          price: 400,
          currency: 'starlight',
          description: '装满知识的书架',
          scoreBonus: 40,
          isNew: false,
          isHot: true
        }
      ],
      wallpaper: [
        { 
          id: 5, 
          name: '粉色壁纸', 
          icon: '/assets/decorations/wall_pink.png',
          type: 'wallpaper',
          typeName: '壁纸',
          level: 1,
          price: 200,
          currency: 'starlight',
          description: '温柔的粉色背景墙',
          scoreBonus: 30,
          isNew: true,
          isHot: false
        },
        { 
          id: 6, 
          name: '蓝色壁纸', 
          icon: '/assets/decorations/wall_blue.png',
          type: 'wallpaper',
          typeName: '壁纸',
          level: 1,
          price: 200,
          currency: 'starlight',
          description: '清新的蓝色背景墙',
          scoreBonus: 30,
          isNew: false,
          isHot: false
        },
        { 
          id: 7, 
          name: '花纹壁纸', 
          icon: '/assets/decorations/wall_pattern.png',
          type: 'wallpaper',
          typeName: '壁纸',
          level: 2,
          price: 350,
          currency: 'starlight',
          description: '精美的花纹背景墙',
          scoreBonus: 50,
          isNew: false,
          isHot: true
        },
        { 
          id: 8, 
          name: '星空壁纸', 
          icon: '/assets/decorations/wall_starry.png',
          type: 'wallpaper',
          typeName: '壁纸',
          level: 3,
          price: 600,
          currency: 'starlight',
          description: '梦幻的星空背景墙',
          scoreBonus: 80,
          isNew: true,
          isHot: true
        }
      ],
      floor: [
        { 
          id: 9, 
          name: '木质地板', 
          icon: '/assets/decorations/floor_wood.png',
          type: 'floor',
          typeName: '地板',
          level: 1,
          price: 300,
          currency: 'starlight',
          description: '温暖的木质地板',
          scoreBonus: 40,
          isNew: false,
          isHot: true
        },
        { 
          id: 10, 
          name: '瓷砖地板', 
          icon: '/assets/decorations/floor_tile.png',
          type: 'floor',
          typeName: '地板',
          level: 1,
          price: 250,
          currency: 'starlight',
          description: '光滑的瓷砖地板',
          scoreBonus: 30,
          isNew: false,
          isHot: false
        },
        { 
          id: 11, 
          name: '粉色地毯', 
          icon: '/assets/decorations/carpet_pink.png',
          type: 'floor',
          typeName: '地板',
          level: 2,
          price: 400,
          currency: 'starlight',
          description: '柔软的粉色地毯',
          scoreBonus: 50,
          isNew: true,
          isHot: false
        },
        { 
          id: 12, 
          name: '毛绒地毯', 
          icon: '/assets/decorations/carpet_fluffy.png',
          type: 'floor',
          typeName: '地板',
          level: 3,
          price: 550,
          currency: 'starlight',
          description: '超舒适的毛绒地毯',
          scoreBonus: 70,
          isNew: false,
          isHot: true
        }
      ],
      decoration: [
        { 
          id: 13, 
          name: '小玩偶', 
          icon: '/assets/decorations/doll.png',
          type: 'decoration',
          typeName: '装饰品',
          level: 1,
          price: 150,
          currency: 'starlight',
          description: '可爱的装饰玩偶',
          scoreBonus: 20,
          isNew: false,
          isHot: false
        },
        { 
          id: 14, 
          name: '绿植', 
          icon: '/assets/decorations/plant.png',
          type: 'decoration',
          typeName: '装饰品',
          level: 1,
          price: 100,
          currency: 'starlight',
          description: '生机勃勃的小绿植',
          scoreBonus: 15,
          isNew: false,
          isHot: false
        },
        { 
          id: 15, 
          name: '台灯', 
          icon: '/assets/decorations/lamp.png',
          type: 'decoration',
          typeName: '装饰品',
          level: 2,
          price: 180,
          currency: 'starlight',
          description: '温馨的阅读台灯',
          scoreBonus: 25,
          isNew: true,
          isHot: false
        },
        { 
          id: 16, 
          name: '挂饰', 
          icon: '/assets/decorations/ornament.png',
          type: 'decoration',
          typeName: '装饰品',
          level: 2,
          price: 200,
          currency: 'starlight',
          description: '精美的墙面挂饰',
          scoreBonus: 30,
          isNew: false,
          isHot: true
        }
      ]
    },
    
    // 当前显示的商品
    currentProducts: [],
    
    // 弹窗状态
    showProductDetail: false,
    showBuySuccess: false,
    selectedProduct: null,
    canAfford: true
  },

  onLoad() {
    this.loadProducts();
    this.loadUserPoints();
  },

  // 加载商品
  loadProducts() {
    const { activeCategory, products } = this.data;
    this.setData({
      currentProducts: products[activeCategory] || []
    });
  },

  // 加载用户积分
  loadUserPoints() {
    // TODO: 从云数据库加载用户实际积分
    // 这里使用模拟数据
  },

  // 切换分类
  switchCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({ activeCategory: categoryId });
    this.loadProducts();
  },

  // 点击商品
  onProductTap(e) {
    const productId = e.currentTarget.dataset.id;
    const { activeCategory, products } = this.data;
    const product = products[activeCategory].find(p => p.id === productId);
    
    if (product) {
      const canAfford = this.canAffordProduct(product);
      this.setData({
        selectedProduct: product,
        canAfford: canAfford,
        showProductDetail: true
      });
    }
  },

  // 判断是否能购买
  canAffordProduct(product) {
    const { userPoints } = this.data;
    if (product.currency === 'starlight') {
      return userPoints.starlight >= product.price;
    } else {
      return userPoints.crystal >= product.price;
    }
  },

  // 关闭商品详情
  closeProductDetail() {
    this.setData({
      showProductDetail: false,
      selectedProduct: null
    });
  },

  // 确认购买
  confirmBuy() {
    const { selectedProduct, userPoints } = this.data;
    
    if (!selectedProduct) {
      return;
    }
    
    // 检查积分
    if (!this.canAffordProduct(selectedProduct)) {
      wx.showToast({
        title: '积分不足哦~',
        icon: 'none'
      });
      return;
    }
    
    // TODO: 调用云函数购买
    // 模拟购买成功
    wx.showLoading({ title: '购买中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 扣除积分
      const pointsKey = selectedProduct.currency === 'starlight' ? 'starlight' : 'crystal';
      const newPoints = {
        ...userPoints,
        [pointsKey]: userPoints[pointsKey] - selectedProduct.price
      };
      
      this.setData({
        userPoints: newPoints,
        showProductDetail: false,
        showBuySuccess: true
      });
      
      // TODO: 保存到数据库
    }, 1000);
  },

  // 关闭购买成功提示
  closeBuySuccess() {
    this.setData({
      showBuySuccess: false,
      selectedProduct: null
    });
  }
});
