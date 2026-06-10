import { ethers, Wallet, HDNodeWallet, JsonRpcProvider } from "ethers";

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

/**
 * Create a wallet using different methods (random, private key, mnemonic)
 * @param provider - Ethereum JSON RPC provider
 * @param idx - Method index (0: random, 1: private key, 2: mnemonic)
 * @returns Created wallet or undefined if invalid index
 */
export const createWallet = async (provider: JsonRpcProvider, idx: number): Promise<HDNodeWallet|Wallet | undefined> => {
    if (idx === 0) {
        // 1. create a random wallet
        console.log("\nCreating a random wallet...");
        const wallet: HDNodeWallet = ethers.Wallet.createRandom();
        wallet.connect(provider);
        console.log("Address:", wallet.address);
        console.log("Private Key:", wallet.privateKey);
        console.log("Mnemonic Phrase:", wallet.mnemonic?.phrase);
        return wallet;
    } else if (idx === 1) {
        // 2. create a wallet from a private key
        console.log("\nCreating a wallet from a private key...");
        const privateKey: string = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b';
        const wallet: Wallet = new ethers.Wallet(privateKey, provider);
        console.log("Address:", wallet.address);
        console.log("Private Key:", wallet.privateKey);
        // Note: The mnemonic phrase is not stored in the wallet object when created from a private key
        console.log("Mnemonic Phrase:", (wallet as any).mnemonic?.phrase);
        return wallet;
    } else if (idx === 2) {
        // 3. create a wallet from a mnemonic phrase
        console.log("\nCreating a wallet from a mnemonic phrase...");
        const mnemonicPhrase: string = "horror coconut base category fire secret current cricket second dog cable win";
        const wallet: HDNodeWallet = ethers.Wallet.fromPhrase(mnemonicPhrase);
        await wallet.connect(provider);
        console.log("Address:", wallet.address);
        console.log("Private Key:", wallet.privateKey);
        console.log("Mnemonic Phrase:", wallet.mnemonic?.phrase);
        return wallet;
    }
    return undefined;
};

const main = async (): Promise<void> => {
    let start: number = Date.now();
    try {
        const rpc_url: string = rpc_urls[0] as string;
        console.log(`Getting information from RPC URL: ${rpc_url}`);
        const provider: JsonRpcProvider = new ethers.JsonRpcProvider(rpc_url);
        const blockNumber: number = await provider.getBlockNumber();
        console.log("Current block number:", blockNumber);
        
        await createWallet(provider, 0);
        await createWallet(provider, 1);
        await createWallet(provider, 2);
    } catch (error) {
        // Code to handle the error
        const err = error as Error;
        console.error("An error occurred:", err.message);
    }

    let end: number = Date.now();
    console.log(`Execution Time: ${end - start} ms`);
};

main();