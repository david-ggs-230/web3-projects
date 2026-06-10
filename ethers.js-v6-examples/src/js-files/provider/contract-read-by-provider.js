import { ethers } from "ethers";
// Public Ethereum RPC Endpoints and Free Ethereum Nodes
const rpc_urls = [
    // Mainnet
    // from https://chainlist.org/chain/1
    "https://ethereum-rpc.publicnode.com",
    //"https://public-eth.nownodes.io/",
    // Sepolia Testnet
    //"https://sepolia.infura.io/v3/27eb23f40b964c9bb71b62f721e594e7",
    "https://ethereum-sepolia-rpc.publicnode.com",
    //"https://sepolia.drpc.org/",
    //local hardhat node
    "http://localhost:8545"
];
const readTetherContract = async (rpc_url) => {
    let start = Date.now();
    try {

        // Tether: USDT Stablecoin on Ethereum Mainnet
        const tetherContractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        // Tether: USDT Stablecoin on Ethereum Mainnet - human readable ABI    
        const human_readable_abi = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)"
        ];
        // Tether: USDT Stablecoin on Ethereum Mainnet - JSON ABI
        const json_abi =
            [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }];

        console.log(`Getting information from RPC URL: ${rpc_url}`);
        const provider = new ethers.JsonRpcProvider(rpc_url);
        const blockNumber = await provider.getBlockNumber();
        console.log("Current block number:", blockNumber);
        const tetherContract = new ethers.Contract(tetherContractAddress, human_readable_abi, provider);
        const tetherContract2 = new ethers.Contract(tetherContractAddress, json_abi, provider);
        const symbol = await tetherContract.symbol();
        console.log("Token symbol:", symbol);
        const decimals = await tetherContract.decimals();
        console.log("Token decimals:", decimals);
        const totalSupply = await tetherContract.totalSupply();
        console.log("Total supply:", ethers.formatUnits(totalSupply, decimals), symbol);
        //Aeroswap 2: 0xFb19ffd1Ff9316b7f5Bba076eF4b78E4bBeDf4E1
        await getTokenBalance(tetherContract, "0xFb19ffd1Ff9316b7f5Bba076eF4b78E4bBeDf4E1");
        await getTokenBalance(tetherContract2, "0xFb19ffd1Ff9316b7f5Bba076eF4b78E4bBeDf4E1");
        //0x13A31B4c11d5CFb6c5edA912d6dbE32927D263bB
        await getTokenBalance(tetherContract, "0x13A31B4c11d5CFb6c5edA912d6dbE32927D263bB");

    } catch (error) {
        // Code to handle the error
        console.error("An error occurred:", error.message);
    }

    let end = Date.now();
    console.log(`Execution Time: ${end - start} ms\n`);
};

//Token USDC on Ethereum Mainnet
const readUsdcStableCoinContract = async (rpc_url) => {
    let start = Date.now();
    try {

        // USDC Stablecoin on Ethereum Mainnet
        const contractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

        // USDC Stablecoin on Ethereum Mainnet - ABI
        const human_readable_abi = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)"
        ];
        console.log(`Getting information from RPC URL: ${rpc_url}`);
        const provider = new ethers.JsonRpcProvider(rpc_url);
        const blockNumber = await provider.getBlockNumber();
        console.log("Current block number:", blockNumber);

        const contract = new ethers.Contract(contractAddress, human_readable_abi, provider);
        const symbol = await contract.symbol();
        console.log("Token symbol:", symbol);
        const decimals = await contract.decimals();
        console.log("Token decimals:", decimals);
        const totalSupply = await contract.totalSupply();
        console.log("Total supply:", ethers.formatUnits(totalSupply, decimals), symbol);

        //0x38AAEF3782910bdd9eA3566C839788Af6FF9B200
        await getTokenBalance(contract, "0x38AAEF3782910bdd9eA3566C839788Af6FF9B200");
        // Sky: PSM: 0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341
        await getTokenBalance(contract, "0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341");

    } catch (error) {
        // Code to handle the error
        console.error("An error occurred:", error.message);
    }

    let end = Date.now();
    console.log(`Execution Time: ${end - start} ms\n`);
};
const getTokenBalance = async (contract, address) => {
    try {
        const balance = await contract.balanceOf(address);
        const symbol = await contract.symbol();
        console.log(`Balance of ${address}: ${ethers.formatUnits(balance, 6)} ${symbol}`);
    } catch (error) {
        // Code to handle the error
        console.error("An error occurred:", error.message);
    }
};
const main = async () => {
    // Read tether contract: USDT Stablecoin on Ethereum Mainnet
    await readTetherContract(rpc_urls[0]);
    // Read USDC Stablecoin on Ethereum Mainnet
    await readUsdcStableCoinContract(rpc_urls[0]);
}

main();