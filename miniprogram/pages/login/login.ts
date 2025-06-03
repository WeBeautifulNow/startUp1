// login.ts
import { DEFAULT_AVATAR_URL } from '../../config/constants'

Page({
  data: {
    avatarUrl: '',
    nickName: '',
    defaultAvatarUrl: DEFAULT_AVATAR_URL
  },

  onLoad() {
    // 检查是否已经登录
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      wx.redirectTo({
        url: '/pages/index/index'
      })
    }
  },

  onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl
    })
  },

  onInputNickname(e: any) {
    this.setData({
      nickName: e.detail.value
    })
  },

  handleLogin() {
    const { avatarUrl, nickName } = this.data
    
    if (!avatarUrl || !nickName) {
      wx.showToast({
        title: '请完善信息',
        icon: 'none'
      })
      return
    }

    // 保存用户信息
    const userInfo = {
      avatarUrl,
      nickName
    }
    wx.setStorageSync('userInfo', userInfo)

    // 初始化用户统计数据
    const userStats = {
      playCount: 0,
      winCount: 0,
      winRate: '0%'
    }
    wx.setStorageSync('userStats', userStats)

    // 登录成功，跳转到首页
    wx.redirectTo({
      url: '/pages/index/index'
    })
  }
}) 