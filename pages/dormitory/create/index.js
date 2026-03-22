// pages/dormitory/create/index.js - 原生组件版

Page({
  data: {
    formData: {
      dormName: '',
      style: '',
      capacity: 6,
      ageGroup: '',
      description: '',
      agreement: '✨ 这里是温暖的女生小天地，我们一起：互相尊重、保守秘密、彼此鼓励、共同成长 💕'
    },
    styleOptions: [
      { label: '🌸 温馨', value: 'warm' },
      { label: '🎀 可爱', value: 'cute' },
      { label: '✨ 简约', value: 'simple' }
    ],
    ageOptions: [
      { label: '12-18 岁（学生）', value: '12-18' },
      { label: '18-25 岁（大学/职场）', value: '18-25' },
      { label: '25-35 岁（职场/宝妈）', value: '25-35' },
      { label: '35-45 岁（成熟女性）', value: '35-45' }
    ],
    showStylePicker: false,
    showAgePicker: false,
    submitting: false
  },

  // 输入框变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 显示风格选择器
  showStyleSelector() {
    this.setData({
      showStylePicker: true
    });
  },

  // 隐藏风格选择器
  hideStylePicker() {
    this.setData({
      showStylePicker: false
    });
  },

  // 选择风格
  selectStyle(e) {
    const { item } = e.currentTarget.dataset;
    this.setData({
      'formData.style': item.label
    });
  },

  // 确认风格
  confirmStyle() {
    this.hideStylePicker();
    if (!this.data.formData.style) {
      wx.showToast({
        title: '请选择宿舍风格',
        icon: 'none'
      });
    }
  },

  // 选择人数
  selectCapacity(e) {
    const { value } = e.currentTarget.dataset;
    this.setData({
      'formData.capacity': parseInt(value)
    });
  },

  // 显示年龄选择器
  showAgeSelector() {
    this.setData({
      showAgePicker: true
    });
  },

  // 隐藏年龄选择器
  hideAgePicker() {
    this.setData({
      showAgePicker: false
    });
  },

  // 选择年龄
  selectAge(e) {
    const { item } = e.currentTarget.dataset;
    this.setData({
      'formData.ageGroup': item.label
    });
  },

  // 确认年龄
  confirmAge() {
    this.hideAgePicker();
    if (!this.data.formData.ageGroup) {
      wx.showToast({
        title: '请选择年龄段',
        icon: 'none'
      });
    }
  },

  // 提交表单
  async onSubmit() {
    const { formData } = this.data;
    
    // 验证必填项
    if (!formData.dormName.trim()) {
      wx.showToast({
        title: '请输入宿舍名称',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.style) {
      wx.showToast({
        title: '请选择宿舍风格',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.ageGroup) {
      wx.showToast({
        title: '请选择年龄段',
        icon: 'none'
      });
      return;
    }

    // 提交到云数据库
    this.setData({
      submitting: true
    });

    try {
      const result = await wx.cloud.callFunction({
        name: 'createDormitory',
        data: {
          dormName: formData.dormName.trim(),
          style: formData.style,
          capacity: formData.capacity,
          ageGroup: formData.ageGroup,
          description: formData.description.trim(),
          agreement: formData.agreement.trim()
        }
      });

      console.log('创建宿舍结果:', result);

      if (result.result && result.result.success) {
        wx.showToast({
          title: '创建成功',
          icon: 'success'
        });
        
        // 跳转到宿舍首页
        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/dormitory/index/index?id=${result.result.dormitoryId}`
          });
        }, 1500);
      } else {
        throw new Error(result.result?.message || '创建失败');
      }
    } catch (error) {
      console.error('创建宿舍失败:', error);
      wx.showToast({
        title: error.message || '创建失败',
        icon: 'none'
      });
    } finally {
      this.setData({
        submitting: false
      });
    }
  }
});
