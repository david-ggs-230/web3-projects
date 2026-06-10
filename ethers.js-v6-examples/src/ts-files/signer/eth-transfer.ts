import { ethers, JsonRpcProvider, Wallet, TransactionResponse} from "ethers";

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
    // local hardhat node
    "http://localhost:8545"
];

// Transfer ETH on Ethereum Testnet Sepolia or local hardhat node
const sendETH = async (wallet: Wallet, addressTo: string, ethValue: string): Promise<TransactionResponse | undefined> => {
    let start = Date.now();
    try {
        // Create a transaction object with the recipient's address and the amount of ETH to send
        const tx = {
            to: addressTo,
            value: ethers.parseEther(ethValue) // Convert the ETH value to Wei
        };
        const receipt: TransactionResponse = await wallet.sendTransaction(tx);
        await receipt.wait(); // Wait for the transaction to be mined
        console.log("Transaction receipt:", receipt);
        return receipt;
    } catch (error) {
        // Code to handle the error
        const err = error as Error;
        console.error("An error occurred:", err.message);
        return undefined;
    } finally {
        let end = Date.now();
        console.log(`sendETH Execution Time: ${end - start} ms`);
    }
};

const createWalletFromPrivateKey = async (provider: JsonRpcProvider, privateKey: string): Promise<Wallet> => {
    console.log("\nCreating a wallet from a private key...");
    return new ethers.Wallet(privateKey, provider);
};

const main = async (): Promise<void> => {
    let start = Date.now();
    try {
        const rpc_url = rpc_urls[4];

        console.log(`Getting information from RPC URL: ${rpc_url}`);
        const provider: JsonRpcProvider = new ethers.JsonRpcProvider(rpc_url);
        const blockNumber: number = await provider.getBlockNumber();
        console.log("Current block number:", blockNumber);
        
        // local hardhat node account #1
        const privateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
        const wallet: Wallet = await createWalletFromPrivateKey(provider, privateKey);
        
        // local hardhat node account #19
        const addressFrom: string = wallet.address;
        const addressTo: string = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
        
        // 获取转账前余额
        const balance01_Before: bigint = await provider.getBalance(addressFrom);
        const balance02_Before: bigint = await provider.getBalance(addressTo);
        
        // 执行转账
        await sendETH(wallet, addressTo, "100.5");
        
        // 获取转账后余额
        const balance01_After: bigint = await provider.getBalance(addressFrom);
        const balance02_After: bigint = await provider.getBalance(addressTo);
        
        // 打印余额信息
        console.log(`Balance of ${addressFrom} before transfer: ${ethers.formatEther(balance01_Before)} ETH`);
        console.log(`Balance of ${addressTo} before transfer: ${ethers.formatEther(balance02_Before)} ETH`);
        console.log(`Balance of ${addressFrom} after transfer: ${ethers.formatEther(balance01_After)} ETH`);
        console.log(`Balance of ${addressTo} after transfer: ${ethers.formatEther(balance02_After)} ETH`);
    } catch (error) {
        // 错误处理
        const err = error as Error;
        console.error("An error occurred:", err.message);
    } finally {
        let end = Date.now();
        console.log(`Main Execution Time: ${end - start} ms`);
    }
};

main();