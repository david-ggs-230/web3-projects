import Web3 from "web3";
const HARDHAT_RPC_URL = "http://localhost:8545";
const HARDHAT_WS_URL = "ws://localhost:8545";
export const contract_address = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042"; // 替换为实际地址
export const contract_abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_biddingTime",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "_brand",
        type: "string",
      },
      {
        internalType: "string",
        name: "_Rnumber",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "carBrand",
        type: "string",
      },
    ],
    name: "AuctionFinalized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "highestBidder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "highestBid",
        type: "uint256",
      },
    ],
    name: "BidEvent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "time",
        type: "uint256",
      },
    ],
    name: "CanceledEvent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "withdrawer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "WithdrawalEvent",
    type: "event",
  },
  {
    inputs: [],
    name: "Mycar",
    outputs: [
      {
        internalType: "string",
        name: "Brand",
        type: "string",
      },
      {
        internalType: "string",
        name: "Rnumber",
        type: "string",
      },
      {
        internalType: "address payable",
        name: "owner",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "STATE",
    outputs: [
      {
        internalType: "enum Auction.auction_state",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "auction_end",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "auction_start",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "bid",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "bidders",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "bids",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "cancel_auction",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "finalizeAuction",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAuctionStatus",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get_owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "highestBid",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "highestBidder",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isBidder",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
]; // 替换为实际 ABI

// 创建 HTTP Provider
export const web3 = new Web3(new Web3.providers.HttpProvider(HARDHAT_RPC_URL));
// 创建合约实例
export const carcontract = new web3.eth.Contract(
  contract_abi,
  contract_address,
);
// 获取账户
let accounts = [];
try {
  accounts = await web3.eth.getAccounts();
} catch (error) {
  console.error("Failed to get accounts:", error);
  accounts = [];
}
export { accounts };

// 更新合约实例
export const updateContract = (newAddress) => {
  return new web3.eth.Contract(contract_abi, contract_address, {
    from: newAddress,
  });
};

// 创建 WebSocket Provider 并处理错误
let web3ws;
let wscontract;

try {
  // 创建 WebSocket Provider 并设置重连选项
  const wsProvider = new Web3.providers.WebsocketProvider(HARDHAT_WS_URL, {
    reconnect: {
      auto: true,
      delay: 5000, // 5秒重连
      maxAttempts: 5,
      onTimeout: false,
    },
  });

  web3ws = new Web3(wsProvider);

  // 监听 WebSocket 连接事件
  wsProvider.on("connect", () => {
    console.log("WebSocket connected");
  });

  wsProvider.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  wsProvider.on("end", (error) => {
    console.error("WebSocket connection ended:", error);
  });

  wscontract = new web3ws.eth.Contract(contract_abi, contract_address);
} catch (error) {
  console.error("Failed to create WebSocket provider:", error);
  // 如果 WebSocket 失败，使用 HTTP 轮询
  wscontract = null;
}

export { web3ws, wscontract };
