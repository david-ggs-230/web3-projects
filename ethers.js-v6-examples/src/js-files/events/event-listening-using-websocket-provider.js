import { ethers } from "ethers";

// RPC Endpoints for different networks
const mainnet = {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrl: "https://ethereum-rpc.publicnode.com",
    wssUrl: "wss://ethereum-rpc.publicnode.com"
};
const sepolia = {
    name: "Sepolia Testnet",
    chainId: 11155111,
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
};
const local = {
    name: "Local Hardhat Node",
    chainId: 31337,
    rpcUrl: "http://localhost:8545",
};

/*
 * lastBlockNumber tracks the last block that was processed.
 * Ensures only new events are processed, avoiding duplicates.
 */
let lastBlockNumber = 0;
let isRunning = false;
// USDT (Tether) ERC20 ABI
const tether_abi = [
    "function name() view returns (string)",
    "function deprecate(address _upgradedAddress)",
    "function approve(address _spender, uint256 _value)",
    "function deprecated() view returns (bool)",
    "function addBlackList(address _evilUser)",
    "function totalSupply() view returns (uint256)",
    "function transferFrom(address _from, address _to, uint256 _value)",
    "function upgradedAddress() view returns (address)",
    "function balances(address) view returns (uint256)",
    "function decimals() view returns (uint256)",
    "function maximumFee() view returns (uint256)",
    "function _totalSupply() view returns (uint256)",
    "function unpause()",
    "function getBlackListStatus(address _maker) view returns (bool)",
    "function allowed(address, address) view returns (uint256)",
    "function paused() view returns (bool)",
    "function balanceOf(address who) view returns (uint256)",
    "function pause()",
    "function getOwner() view returns (address)",
    "function owner() view returns (address)",
    "function symbol() view returns (string)",
    "function transfer(address _to, uint256 _value)",
    "function setParams(uint256 newBasisPoints, uint256 newMaxFee)",
    "function issue(uint256 amount)",
    "function redeem(uint256 amount)",
    "function allowance(address _owner, address _spender) view returns (uint256 remaining)",
    "function basisPointsRate() view returns (uint256)",
    "function isBlackListed(address) view returns (bool)",
    "function removeBlackList(address _clearedUser)",
    "function MAX_UINT() view returns (uint256)",
    "function transferOwnership(address newOwner)",
    "function destroyBlackFunds(address _blackListedUser)",
    "constructor(uint256 _initialSupply, string _name, string _symbol, uint256 _decimals)",
    "event Issue(uint256 amount)",
    "event Redeem(uint256 amount)",
    "event Deprecate(address newAddress)",
    "event Params(uint256 feeBasisPoints, uint maxFee)",
    "event DestroyedBlackFunds(address _blackListedUser, uint _balance)",
    "event AddedBlackList(address _user)",
    "event RemovedBlackList(address _user)",
    "event Approval(address indexed owner, address indexed spender, uint value)",
    "event Transfer(address indexed from, address indexed to, uint value)",
    "event Pause()",
    "event Unpause()"
];

// Listen for USDT Transfer events on Ethereum Mainnet
// Focuses on transfers to/from Binance's hot wallet address
// event-based approach using provider.on() to listen for new blocks
// and filter events in real-time, ensuring immediate detection of 
// relevant transfers without polling delays
const queryMainnetEventOnListening = async () => {
    try {
        console.log(`Connecting to RPC: ${mainnet.wssUrl}`);
        const provider = new ethers.WebSocketProvider(mainnet.wssUrl);

        const startBlock = await provider.getBlockNumber();
        console.log("Current starting block:", startBlock);

        // USDT Contract on Ethereum Mainnet
        const contractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        // Binance Hot Wallet Address
        const binanceAddress = "0x28C6c06298d514Db089934071355E5743bf21d60";

        const contract = new ethers.Contract(contractAddress, tether_abi, provider);

        // Listen for new transfer events
        contract.on("Transfer", (from, to, value, event) => {
            console.log(`New Transfer Event Detected in Block ${event.blockNumber}:`);
            const amount = ethers.formatUnits(value, 6); // USDT uses 6 decimals
            if(to.toLowerCase() === binanceAddress.toLowerCase()) {
                console.log("IN -> Binance:", `${from} → ${to} | ${amount} USDT`);
            }  else if(from.toLowerCase() === binanceAddress.toLowerCase()) {
                console.log("OUT <- Binance:", `${from} → ${to} | ${amount} USDT`);
            }
            });

    } catch (err) {
        console.error("Fatal error:", err.message);
    }
};
// Main entry
const main = async () => {
    const startTime = Date.now();
    queryMainnetEventOnListening();
    const endTime = Date.now();
    console.log(`Listener initialized in: ${endTime - startTime} ms\n`);
};

main();