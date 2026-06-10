import { ethers } from "ethers";

// Public Ethereum RPC Endpoints and Free Ethereum Nodes
const rpc_urls = [
    // Mainnet
    // from https://chainlist.org/chain/1
    "https://ethereum-rpc.publicnode.com",
    "https://public-eth.nownodes.io/",
    // Sepolia Testnet
    //"https://sepolia.infura.io/v3/27eb23f40b964c9bb71b62f721e594e7",
    "https://ethereum-sepolia-rpc.publicnode.com",
    "https://sepolia.drpc.org/",
    //local hardhat node
    "http://localhost:8545"
];
const addresses = [
    //"vitalik.eth": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "0x53d284357ec70cE289D6D64134DfAc8E511c8a3D",
    "0x66f820a414680B5bcda5eECA5dea238543F42054",
    "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0",
    // local hardhat node accounts
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
];
const transactions = [
    // USDT transfer transaction on Ethereum Mainnet
    "0xa14f95be741ccf15e68f0fe7a0f046e5dbd519bc4146ddca0ff918538cb172e8",
    // ETH transfer transaction on Ethereum Mainnet
    "0x217cd2ccb750ae9cb7c8d5a5fab0e3824a88815b28ee4b8607288d5b147ac8a4",
    //Sepolia
    "0x695b71f646c3989dadd0fcf38fe98145389b8db86569447d9f3783cbaea6437f",
    "0x5f104ac744e15f9909a97b344edf976b781c0e072dacf028c263604b46f8c49c"
];
//const provider = new ethers.JsonRpcProvider(url);
// provider is an object that allows us to interact with the Ethereum blockchain.
// It provides methods for sending transactions, querying the blockchain, and more.
//const provider2 = ethers.getDefaultProvider();
//const balance = await provider2.getBalance(`vitalik.eth`);
//console.log(`Balance of vitalik.eth: ${ethers.formatEther(balance)} ETH`);

//Get rpc provider information
const getRPCInfor = async (rpc_url) => {

    let start = Date.now();
    try {
        console.log(`Getting information from RPC URL: ${rpc_url}`);
        const provider = new ethers.JsonRpcProvider(rpc_url);
        // Get network information
        const network = await provider.getNetwork();
        console.log("Network name:", network.name);
        console.log("Chain ID:", network.chainId);

        const blockNumber = await provider.getBlockNumber();
        console.log("Current block number:", blockNumber);
        // Get gas price information
        const feeData = await provider.getFeeData();
        console.log("Gas price (gasPrice):", ethers.formatUnits(feeData.gasPrice, "gwei"), "Gwei");
        console.log("Gas price (maxFeePerGas):", ethers.formatUnits(feeData.maxFeePerGas, "gwei"), "Gwei");
        console.log("Gas price (maxPriorityFeePerGas):", ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei"), "Gwei");
        console.log("FeeData (JSON):", feeData.toJSON());
        // Get transaction information
        for (const tx of transactions) {
            const transaction = await provider.getTransaction(tx);
            console.log("Transaction information:", transaction);
            const transactionReceipt = await provider.getTransactionReceipt(tx);
            console.log("Transaction receipt:", transactionReceipt);
        }

        // Get balance of addresses
        for (const address of addresses) {
            const balance = await provider.getBalance(address);
            console.log(`Balance of ${address}: ${ethers.formatEther(balance)} ETH`);
        }

    } catch (error) {
        // Code to handle the error
        console.error("An error occurred:", error.message);
    }

    let end = Date.now();
    console.log(`Execution Time: ${end - start} ms`);
}

const main = async () => {
    for (const url of rpc_urls) {
        await getRPCInfor(url);
    }
}

main();