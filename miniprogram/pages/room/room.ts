interface IPlayer {
  openId: string;
  avatarUrl: string;
  nickName: string;
  balance: number;
}

interface IMessage {
  id: string;
  type: 'system' | 'transfer';
  content?: string;
  fromId?: string;
  fromName?: string;
  fromAvatar?: string;
  toId?: string;
  toName?: string;
  toAvatar?: string;
  amount?: number;
  timestamp: number;
  timeStr: string;
  fullTimeStr?: string;
  isSelf?: boolean;
}

Page({
  data: {
    roomId: '',
    isCreator: false,
    players: [] as IPlayer[],
    messages: [] as IMessage[],
    showTransferModal: false,
    selectedPlayer: null as IPlayer | null,
    transferAmount: '',
    showBatchTransferModal: false,
    batchTransferList: [] as Array<{ openId: string; avatarUrl: string; nickName: string; amount: string }>,
    showInviteModal: false,
    roomQRCode: '',
    showHelpModal: false
  },

  onLoad(options: any) {
    const { roomId, isCreator } = options;
    if (!roomId) {
      wx.showModal({
        title: '无法进入房间',
        content: '请通过房间号、邀请链接或二维码进入房间',
        showCancel: false,
        success: () => {
          wx.reLaunch({ url: '/pages/index/index' });
        }
      });
      return;
    }
    this.setData({
      roomId,
      isCreator: isCreator === 'true'
    });

    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.addPlayer(userInfo);
      // 添加系统消息
      this.addSystemMessage(`${userInfo.nickName} 加入了房间`);
    }

    // 监听其他玩家加入
    this.listenForNewPlayers();
  },

  addPlayer(playerInfo: any) {
    const players = this.data.players;
    const existingPlayer = players.find(p => p.openId === playerInfo.openId);
    
    if (!existingPlayer) {
      players.push({
        openId: playerInfo.openId,
        avatarUrl: playerInfo.avatarUrl,
        nickName: playerInfo.nickName,
        balance: 0
      });
      this.setData({ players });
    }
  },

  addSystemMessage(content: string) {
    const timestamp = Date.now();
    const messages = this.data.messages;
    messages.push({
      id: timestamp.toString(),
      type: 'system',
      content,
      timestamp,
      timeStr: this.formatTime(timestamp),
      fullTimeStr: this.formatFullTime(timestamp)
    });
    this.setData({ messages });
  },

  listenForNewPlayers() {
    // 这里应该实现实时通信，比如使用WebSocket
    // 为了演示，我们暂时使用模拟数据
    const mockPlayers = [
      {
        openId: 'player1',
        avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
        nickName: '玩家1',
        balance: 0
      },
      {
        openId: 'player2',
        avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
        nickName: '玩家2',
        balance: 0
      }
    ];

    mockPlayers.forEach(player => {
      this.addPlayer(player);
      this.addSystemMessage(`${player.nickName} 加入了房间`);
    });
  },

  shareRoom() {
    this.setData({ showInviteModal: true });
  },

  closeInviteModal() {
    this.setData({ showInviteModal: false, roomQRCode: '' });
  },

  // 生成房间二维码
  async generateRoomQRCode() {
    const roomId = this.data.roomId;
    // 这里假设你有云开发环境，可以用 wx.cloud.callFunction 或 wx.cloud.getWXACode
    // 这里只做演示，实际项目需配置云函数
    wx.showLoading({ title: '生成中...' });
    try {
      // 示例：调用云函数生成小程序码
      const res = await wx.cloud.callFunction({
        name: 'getRoomQRCode',
        data: { roomId }
      });
      this.setData({ roomQRCode: res.result.qrCodeUrl });
    } catch (e) {
      wx.showToast({ title: '二维码生成失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 分享到微信
  onShareAppMessage() {
    const roomId = this.data.roomId;
    return {
      title: '邀请你加入房间',
      path: `/pages/room/room?roomId=${roomId}&isCreator=false`
    };
  },

  showTransferModal(e: any) {
    const player = e.currentTarget.dataset.player;
    const userInfo = wx.getStorageSync('userInfo');
    
    // 检查是否是给自己转账
    if (player.openId === userInfo.openId) {
      wx.showToast({
        title: '不能给自己转账',
        icon: 'none'
      });
      return;
    }

    this.setData({
      showTransferModal: true,
      selectedPlayer: player,
      transferAmount: ''
    });
  },

  onAmountInput(e: any) {
    this.setData({
      transferAmount: e.detail.value
    });
  },

  cancelTransfer() {
    this.setData({
      showTransferModal: false,
      selectedPlayer: null,
      transferAmount: ''
    });
  },

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  formatFullTime(timestamp: number): string {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  confirmTransfer() {
    const { selectedPlayer, transferAmount, players } = this.data;
    if (!selectedPlayer || !transferAmount) return;

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      });
      return;
    }

    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '用户信息获取失败',
        icon: 'none'
      });
      return;
    }

    // 更新玩家余额
    const updatedPlayers = players.map(player => {
      if (player.openId === selectedPlayer.openId) {
        // 接收方增加金额
        return { ...player, balance: player.balance + amount };
      } else if (player.openId === userInfo.openId) {
        // 发送方减少金额
        return { ...player, balance: player.balance - amount };
      }
      return player;
    });

    const timestamp = Date.now();
    // 添加转账消息
    const messages = this.data.messages;
    messages.push({
      id: timestamp.toString(),
      type: 'transfer',
      fromId: userInfo.openId,
      fromName: userInfo.nickName,
      fromAvatar: userInfo.avatarUrl,
      toId: selectedPlayer.openId,
      toName: selectedPlayer.nickName,
      toAvatar: selectedPlayer.avatarUrl,
      amount,
      timestamp,
      timeStr: this.formatTime(timestamp),
      fullTimeStr: this.formatFullTime(timestamp),
      isSelf: true // 这里先写 true，后面 setData 时修正
    });

    this.setData({
      players: updatedPlayers,
      messages: messages.map(msg => msg.type === 'transfer' ? { ...msg, isSelf: msg.fromId === userInfo.openId } : msg),
      showTransferModal: false,
      selectedPlayer: null,
      transferAmount: ''
    });

    // 显示转账成功提示
    wx.showToast({
      title: '转账成功',
      icon: 'success'
    });
  },

  settleRoom() {
    if (!this.data.isCreator) return;

    wx.showModal({
      title: '确认结算',
      content: '确定要结算并关闭当前房间吗？',
      success: (res) => {
        if (res.confirm) {
          // 保存结算记录
          const settlement = {
            roomId: this.data.roomId,
            players: this.data.players,
            messages: this.data.messages,
            timestamp: Date.now()
          };

          // 保存到本地存储
          const history = wx.getStorageSync('roomHistory') || [];
          history.unshift(settlement);
          wx.setStorageSync('roomHistory', history);

          // 从 activeRooms 移除
          let activeRooms = wx.getStorageSync('activeRooms') || [];
          activeRooms = activeRooms.filter((id: string) => id !== this.data.roomId);
          wx.setStorageSync('activeRooms', activeRooms);

          // 删除房间数据
          wx.removeStorageSync(`room_${this.data.roomId}`);

          // 跳转到首页
          wx.reLaunch({ url: '/pages/index/index' });
        }
      }
    });
  },

  updateUserStats() {
    const stats = wx.getStorageSync('userStats') || {
      playCount: 0,
      winCount: 0,
      winRate: '0%'
    };

    stats.playCount += 1;
    // 这里可以添加更多统计逻辑

    wx.setStorageSync('userStats', stats);
  },

  // 支出按钮点击
  showBatchTransferModal() {
    const userInfo = wx.getStorageSync('userInfo');
    // 只显示非自己的玩家
    const batchTransferList = this.data.players
      .filter(p => p.openId !== userInfo.openId)
      .map(p => ({ ...p, amount: '' }));
    this.setData({
      showBatchTransferModal: true,
      batchTransferList
    });
  },

  onBatchAmountInput(e: any) {
    const index = e.currentTarget.dataset.index;
    let value = e.detail.value;
    // 只允许数字和小数点，且只保留第一个小数点
    value = value.replace(/[^\d.]/g, '').replace(/^0+(?=\d)/, '').replace(/\.(?=.*\.)/g, '');
    const batchTransferList = this.data.batchTransferList;
    batchTransferList[index].amount = value;
    this.setData({ batchTransferList });
  },

  cancelBatchTransfer() {
    this.setData({ showBatchTransferModal: false });
  },

  confirmBatchTransfer() {
    const userInfo = wx.getStorageSync('userInfo');
    const { batchTransferList, players } = this.data;
    let hasTransfer = false;
    const updatedPlayers = [...players];
    const messages = this.data.messages;
    const timestampBase = Date.now();
    for (let idx = 0; idx < batchTransferList.length; idx++) {
      const item = batchTransferList[idx];
      const amount = parseFloat(item.amount);
      if (item.amount && (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(item.amount) || amount <= 0)) {
        wx.showToast({ title: '请输入大于0的正数，最多两位小数', icon: 'none' });
        return;
      }
      if (!isNaN(amount) && amount > 0) {
        hasTransfer = true;
        // 更新玩家余额
        const pIndex = updatedPlayers.findIndex(p => p.openId === item.openId);
        if (pIndex !== -1) {
          updatedPlayers[pIndex].balance += amount;
        }
        const selfIndex = updatedPlayers.findIndex(p => p.openId === userInfo.openId);
        if (selfIndex !== -1) {
          updatedPlayers[selfIndex].balance -= amount;
        }
        // 添加转账消息
        const timestamp = timestampBase + idx;
        messages.push({
          id: timestamp.toString(),
          type: 'transfer',
          fromId: userInfo.openId,
          fromName: userInfo.nickName,
          fromAvatar: userInfo.avatarUrl,
          toId: item.openId,
          toName: item.nickName,
          toAvatar: item.avatarUrl,
          amount,
          timestamp,
          timeStr: this.formatTime(timestamp),
          fullTimeStr: this.formatFullTime(timestamp),
          isSelf: true
        });
      }
    }
    if (!hasTransfer) {
      wx.showToast({ title: '请输入金额', icon: 'none' });
      return;
    }
    this.setData({
      players: updatedPlayers,
      messages,
      showBatchTransferModal: false
    });
    wx.showToast({ title: '支出成功', icon: 'success' });
  },

  showHelp() {
    this.setData({ showHelpModal: true });
  },

  closeHelpModal() {
    this.setData({ showHelpModal: false });
  },

  goToHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  copyRoomId() {
    wx.setClipboardData({
      data: this.data.roomId,
      success: () => {
        wx.showToast({ title: '房间号已复制', icon: 'success' });
      }
    });
  }
}); 