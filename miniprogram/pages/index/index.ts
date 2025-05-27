// index.ts
// 获取应用实例
const app = getApp()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

interface IUserInfo {
  avatarUrl: string;
  nickName: string;
}

interface IStats {
  playCount: number;
  winCount: number;
  winRate: string;
}

Page({
  data: {
    motto: 'Hello World',
    userInfo: {} as IUserInfo,
    stats: {
      playCount: 0,
      winCount: 0,
      winRate: '0%'
    } as IStats,
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },

  onLoad() {
    this.getUserInfo()
    this.getUserStats()
  },

  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs',
    })
  },

  onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },

  onInputChange(e: any) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },

  getUserInfo() {
    if (wx.getUserProfile) {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          // 保存用户信息到本地存储
          wx.setStorageSync('userInfo', res.userInfo)
        },
        fail: (err) => {
          console.error('获取用户信息失败', err)
          // 尝试从本地存储获取用户信息
          const userInfo = wx.getStorageSync('userInfo')
          if (userInfo) {
            this.setData({ userInfo })
          }
        }
      })
    }
  },

  getUserStats() {
    // 从本地存储获取统计数据
    const stats = wx.getStorageSync('userStats') || {
      playCount: 0,
      winCount: 0,
      winRate: '0%'
    }
    this.setData({ stats })
  },

  showHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },

  createRoom() {
    // 生成随机房间ID
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase()
    wx.navigateTo({
      url: `/pages/room/room?roomId=${roomId}&isCreator=true`
    })
  },

  joinRoom() {
    wx.showModal({
      title: '加入房间',
      editable: true,
      placeholderText: '请输入房间ID',
      success: (res) => {
        if (res.confirm && res.content) {
          wx.navigateTo({
            url: `/pages/room/room?roomId=${res.content}&isCreator=false`
          })
        }
      }
    })
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  }
})
