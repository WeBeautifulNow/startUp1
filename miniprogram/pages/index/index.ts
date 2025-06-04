// index.ts
// 获取应用实例
import { DEFAULT_AVATAR_URL } from '../../config/constants'

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
    defaultAvatarUrl: DEFAULT_AVATAR_URL
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    // 每次页面显示时检查登录状态
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      // 未登录，跳转到登录页面
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    
    // 已登录，设置用户信息
    this.setData({
      userInfo,
      hasUserInfo: true
    })
    
    // 获取用户统计数据
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
      hasUserInfo: nickName && avatarUrl && avatarUrl !== DEFAULT_AVATAR_URL,
    })
    // 保存更新后的用户信息
    wx.setStorageSync('userInfo', this.data.userInfo)
  },

  onInputChange(e: any) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== DEFAULT_AVATAR_URL,
    })
    // 保存更新后的用户信息
    wx.setStorageSync('userInfo', this.data.userInfo)
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
    const generateRoomId = () => {
      // 使用时间戳+随机数的方式生成更唯一的房间号
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 4);
      return (timestamp + random).toUpperCase();
    };

    // 获取已存在的房间列表
    const existingRooms = wx.getStorageSync('activeRooms') || [];
    
    // 生成新的房间号并确保唯一性
    let roomId;
    do {
      roomId = generateRoomId();
    } while (existingRooms.includes(roomId));

    // 保存新房间信息
    const newRoom = {
      roomId,
      creator: wx.getStorageSync('userInfo'),
      createTime: Date.now(),
      players: [wx.getStorageSync('userInfo')],
      transactions: []
    };
    
    existingRooms.push(roomId);
    wx.setStorageSync('activeRooms', existingRooms);
    wx.setStorageSync(`room_${roomId}`, newRoom);

    // 跳转到房间页面
    wx.navigateTo({
      url: `/pages/room/room?roomId=${roomId}&isCreator=true`
    });
  },

  joinRoom() {
    wx.showModal({
      title: '加入房间',
      editable: true,
      placeholderText: '请输入房间ID',
      success: (res) => {
        if (res.confirm && res.content) {
          const roomId = res.content.toUpperCase();
          const roomData = wx.getStorageSync(`room_${roomId}`);
          
          if (!roomData) {
            wx.showToast({
              title: '房间不存在',
              icon: 'none'
            });
            return;
          }

          // 检查用户是否已在房间中
          const userInfo = wx.getStorageSync('userInfo');
          const isInRoom = roomData.players.some(player => player.openId === userInfo.openId);
          
          if (!isInRoom) {
            // 更新房间信息
            roomData.players.push(userInfo);
            wx.setStorageSync(`room_${roomId}`, roomData);
          }

          // 无论是否已在房间，均跳转
          wx.navigateTo({
            url: `/pages/room/room?roomId=${roomId}&isCreator=false`
          });
        }
      }
    });
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  }
})
