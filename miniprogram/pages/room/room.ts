interface IPlayer {
  openId: string;
  avatarUrl: string;
  nickName: string;
  balance: number;
}

interface ITransaction {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
  timestamp: number;
}

Page({
  data: {
    roomId: '',
    isCreator: false,
    players: [] as IPlayer[],
    transactions: [] as ITransaction[],
    showTransferModal: false,
    selectedPlayer: null as IPlayer | null,
    transferAmount: ''
  },

  onLoad(options: any) {
    const { roomId, isCreator } = options;
    this.setData({
      roomId,
      isCreator: isCreator === 'true'
    });

    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.addPlayer(userInfo);
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

    this.setData({
      players: [...this.data.players, ...mockPlayers]
    });
  },

  shareRoom() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  showTransferModal(e: any) {
    const player = e.currentTarget.dataset.player;
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

    // 更新玩家余额
    const updatedPlayers = players.map(player => {
      if (player.openId === selectedPlayer.openId) {
        return { ...player, balance: player.balance + amount };
      }
      return player;
    });

    // 添加交易记录
    const userInfo = wx.getStorageSync('userInfo');
    const newTransaction: ITransaction = {
      id: Date.now().toString(),
      fromId: userInfo.openId,
      fromName: userInfo.nickName,
      toId: selectedPlayer.openId,
      toName: selectedPlayer.nickName,
      amount,
      timestamp: Date.now()
    };

    this.setData({
      players: updatedPlayers,
      transactions: [newTransaction, ...this.data.transactions],
      showTransferModal: false,
      selectedPlayer: null,
      transferAmount: ''
    });
  },

  settleRoom() {
    if (!this.data.isCreator) return;

    wx.showModal({
      title: '确认结算',
      content: '确定要结算当前房间吗？',
      success: (res) => {
        if (res.confirm) {
          // 保存结算记录
          const settlement = {
            roomId: this.data.roomId,
            players: this.data.players,
            transactions: this.data.transactions,
            timestamp: Date.now()
          };

          // 保存到本地存储
          const history = wx.getStorageSync('roomHistory') || [];
          history.unshift(settlement);
          wx.setStorageSync('roomHistory', history);

          // 更新用户统计
          this.updateUserStats();

          // 返回主页
          wx.navigateBack();
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
  }
}); 