export const counterAbi = {
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "NotOwner",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "newCount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "changedBy",
          type: "address",
        },
      ],
      name: "CountChanged",
      type: "event",
    },
    {
      inputs: [],
      name: "count",
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
      name: "increment",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "incrementBy",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
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
      name: "reset",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  buildInfoId: "solc-0_8_34-06ec64568d5865ae0c8a2d8f1feac11e3d11c617",
  amoyaddress: "0x76B4e9B8Ae3ed72745AEe76a5f60c5C8BbAb9CC6",
  sepoliaaddress: "0x8DEA53044a69Df2819c77Bf8eb073ff5B986d972",
} as const;
