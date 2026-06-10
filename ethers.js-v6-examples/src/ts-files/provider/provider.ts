import { ethers, JsonRpcProvider } from "ethers";

// Public Ethereum RPC Endpoints and Free Ethereum Nodes
const rpc_urls: string[] = [
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

const addresses: string[] = [
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "0x53d284357ec70cE289D6D64134DfAc8E511c8a3D",
    "0x66f820a414680B5bcda5eECA5dea238543F42054",
    "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0",
    // Local hardhat node accounts
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
];

const transactions: string[] = [
    // USDT transfer transaction on Ethereum Mainnet
    "0xa14f95be741ccf15e68f0fe7a0f046e5dbd519bc4146ddca0ff918538cb172e8",
    // ETH transfer transaction on Ethereum Mainnet
    "0x217cd2ccb750ae9cb7c8d5a5fab0e3824a88815b28ee4b8607288d5b147ac8a4",
    //Sepolia
    "0x695b71f646c3989dadd0fcf38fe98145389b8db86569447d9f3783cbaea6437f",
    "0x5f104ac744e15f9909a97b344edf976b781c0e072dacf028c263604b46f8c49c"
];

// Get rpc provider information
const getRPCInfor = async (rpc_url: string): Promise<void> => {
    let start = Date.now();
    try {
        console.log(`Getting information from RPC URL: ${rpc_url}`);
        const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(rpc_url);
        
        // Get network information
        const network: ethers.Network = await provider.getNetwork();
        console.log("Network name:", network.name);
        console.log("Chain ID:", network.chainId);

        const blockNumber: number = await provider.getBlockNumber();
        console.log("Current block number:", blockNumber);

        // Get gas price information
        const feeData: ethers.FeeData = await provider.getFeeData();
        console.log("Gas price (gasPrice):", ethers.formatUnits(feeData.gasPrice || 0, "gwei"), "Gwei");
        console.log("Gas price (maxFeePerGas):", ethers.formatUnits(feeData.maxFeePerGas || 0, "gwei"), "Gwei");
        console.log("Gas price (maxPriorityFeePerGas):", ethers.formatUnits(feeData.maxPriorityFeePerGas || 0, "gwei"), "Gwei");
        console.log("FeeData (JSON):", feeData.toJSON());

        // Get transaction information
        for (const tx of transactions) {
            const transaction: ethers.TransactionResponse | null = await provider.getTransaction(tx);
            console.log("Transaction information:", transaction);
            
            const transactionReceipt: ethers.TransactionReceipt | null = await provider.getTransactionReceipt(tx);
            console.log("Transaction receipt:", transactionReceipt);
        }

        // Get balance of addresses
        for (const address of addresses) {
            const balance: bigint = await provider.getBalance(address);
            console.log(`Balance of ${address}: ${ethers.formatEther(balance)} ETH`);
        }

    } catch (error) {
        // Type-safe error handling
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("An error occurred:", errorMessage);
    }

    const end = Date.now();
    console.log(`Execution Time: ${end - start} ms`);
};

const main = async (): Promise<void> => {
    for (const url of rpc_urls) {
        await getRPCInfor(url);
    }
};

// Execute the main function and handle top-level await errors
main().catch((error) => {
    console.error("Main function failed:", error instanceof Error ? error.message : error);
    process.exit(1);
});