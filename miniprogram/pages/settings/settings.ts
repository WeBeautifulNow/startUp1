Page({
  data: {},

  clearHistory() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有历史记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('roomHistory');
          wx.showToast({
            title: '清除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  clearUserData() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有用户数据吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('userStats');
          wx.showToast({
            title: '清除成功',
            icon: 'success'
          });
          // 返回首页并刷新
          wx.reLaunch({
            url: '/pages/index/index'
          });
        }
      }
    });
  }
}); 