import { ethers, JsonRpcProvider, Network, FeeData, TransactionResponse, TransactionReceipt } from "ethers";

// Public Ethereum RPC Endpoints and Free Ethereum Nodes
const rpc_urls: string[] = [
    // Mainnet
    "https://ethereum-rpc.publicnode.com",
    // Sepolia Testnet
    "https://ethereum-sepolia-rpc.publicnode.com",
    // local hardhat node
    "http://localhost:8545"
];

const addresses: string[] = [
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "0x66f820a414680B5bcda5eECA5dea238543F42054",
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
];

const transactions: string[] = [
    // USDT transfer transaction on Ethereum Mainnet
    "0xa14f95be741ccf15e68f0fe7a0f046e5dbd519bc4146ddca0ff918538cb172e8",
    // ETH transfer transaction on Ethereum Mainnet
    "0x217cd2ccb750ae9cb7c8d5a5fab0e3824a88815b28ee4b8607288d5b147ac8a4",
    // Sepolia
    "0x695b71f646c3989dadd0fcf38fe98145389b8db86569447d9f3783cbaea6437f",
    "0x5f104ac744e15f9909a97b344edf976b781c0e072dacf028c263604b46f8c49c"
];

let provider: JsonRpcProvider | undefined;

// Get network information
const getNetworkInfo = async (): Promise<void> => {
    try {
        if (!provider) throw new Error("Provider is not initialized");
        const network: Network = await provider.getNetwork();
        console.log("Network name:", network.name);
        console.log("Chain ID:", network.chainId);
    } catch (error) {
        const err = error as Error;
        console.error("An error occurred:", err.message);
    }
};

// Get balance of addresses
const getBalance = async (): Promise<void> => {
    try {
        if (!provider) throw new Error("Provider is not initialized");
        for (const address of addresses) {
            const balance = await provider.getBalance(address);
            console.log(`Balance of ${address}: ${ethers.formatEther(balance)} ETH`);
        }
    } catch (error) {
        const err = error as Error;
        console.error("An error occurred:", err.message);
    }
};

// Get block information
const getBlockInfo = async (): Promise<void> => {
    try {
        if (!provider) throw new Error("Provider is not initialized");
        const blockNumber: number = await provider.getBlockNumber();
        console.log("Current block number:", blockNumber);
        const block = await provider.getBlock(blockNumber);
        console.log("Block information:", block);
    } catch (error) {
        const err = error as Error;
        console.error("An error occurred:", err.message);
    }
};

// Get gas price information
const getGasPriceInfo = async (): Promise<void> => {
    try {
        if (!provider) throw new Error("Provider is not initialized");
        const feeData: FeeData = await provider.getFeeData();
        console.log("Gas price (gasPrice):", feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "N/A", "Gwei");
        console.log("Gas price (maxFeePerGas):", feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, "gwei") : "N/A", "Gwei");
        console.log("Gas price (maxPriorityFeePerGas):", feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei") : "N/A", "Gwei");
        console.log("FeeData (JSON):", feeData.toJSON());
    } catch (error) {
        const err = error as Error;
        console.error("An error occurred:", err.message);
    }
};

// Get transaction information
const getTransactionInfo = async (): Promise<void> => {
    try {
        if (!provider) throw new Error("Provider is not initialized");
        for (const tx of transactions) {
            const transaction: TransactionResponse | null = await provider.getTransaction(tx);
            console.log("Transaction information:", transaction);
            const transactionReceipt: TransactionReceipt | null = await provider.getTransactionReceipt(tx);
            console.log("Transaction receipt:", transactionReceipt);
        }
    } catch (error) {
        const err = error as Error;
        console.error("An error occurred:", err.message);
    }
};

// Get transaction count of addresses
const getTransactionCount = async (): Promise<void> => {
    try {
        if (!provider) throw new Error("Provider is not initialized");
        for (const address of addresses) {
            const transactionCount: number = await provider.getTransactionCount(address);
            console.log(`Transaction count for ${address}:`, transactionCount);
        }
    } catch (error) {
        const err = error as Error;
        console.error("An error occurred:", err.message);
    }
};

// Get Code of addresses
const getCode = async (): Promise<void> => {
    try {
        if (!provider) throw new Error("Provider is not initialized");
        for (const address of addresses) {
            const code: string = await provider.getCode(address);
            console.log(`Code at ${address}:`, code);
        }
    } catch (error) {
        const err = error as Error;
        console.error("An error occurred:", err.message);
    }
};

// resolveName
const resolveName = async (name: string): Promise<void> => {
    try {
        if (!provider) throw new Error("Provider is not initialized");
        const address: string | null = await provider.resolveName(name);
        console.log(`Address for ${name}:`, address);
        const avatar: string | null = await provider.getAvatar("vitalik.eth");
        console.log(`Avatar for ${name}:`, avatar);
    } catch (error) {
        const err = error as Error;
        console.error("An error occurred:", err.message);
    }
};

// Get rpc provider information
const getRPCInfo = async (rpc_url: string): Promise<void> => {
    const start: number = Date.now();
    try {
        console.log(`Getting information from RPC URL: ${rpc_url}`);
        provider = new ethers.JsonRpcProvider(rpc_url);
        
        await getNetworkInfo();
        await getBlockInfo();
        await getGasPriceInfo();
        await getBalance();
        await getTransactionCount();
        await getCode();
        await resolveName("vitalik.eth");
        await getTransactionInfo();
    } catch (error) {
        const err = error as Error;
        console.error("An error occurred:", err.message);
    }

    const end: number = Date.now();
    console.log(`Execution Time: ${end - start} ms\n\n`);
};

const main = async (): Promise<void> => {
    for (const url of rpc_urls) {
        await getRPCInfo(url);
    }
};

// Run the main function
main().catch((error) => {
    const err = error as Error;
    console.error("Main function error:", err.message);
    process.exit(1);
});