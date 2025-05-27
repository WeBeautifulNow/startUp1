interface IHistoryItem {
  roomId: string;
  players: Array<{
    openId: string;
    avatarUrl: string;
    nickName: string;
    balance: number;
  }>;
  transactions: Array<{
    id: string;
    fromId: string;
    fromName: string;
    toId: string;
    toName: string;
    amount: number;
    timestamp: number;
  }>;
  timestamp: number;
}

Page({
  data: {
    historyList: [] as IHistoryItem[]
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  loadHistory() {
    const history = wx.getStorageSync('roomHistory') || [];
    this.setData({
      historyList: history
    });
  },

  formatDate(timestamp: number) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
}); 