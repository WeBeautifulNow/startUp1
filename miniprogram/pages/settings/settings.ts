import { DEFAULT_AVATAR_URL } from '../../config/constants'

Page({
  data: {
    userInfo: {} as any,
    defaultAvatarUrl: DEFAULT_AVATAR_URL
  },

  onLoad() {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail
    const userInfo = { ...this.data.userInfo, avatarUrl }
    this.setData({ userInfo })
    wx.setStorageSync('userInfo', userInfo)
  },

  onInputNickname(e: any) {
    const nickName = e.detail.value
    const userInfo = { ...this.data.userInfo, nickName }
    this.setData({ userInfo })
    wx.setStorageSync('userInfo', userInfo)
  },

  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定要清除所有历史记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('history')
          wx.showToast({
            title: '清除成功',
            icon: 'success'
          })
        }
      }
    })
  }
}); 