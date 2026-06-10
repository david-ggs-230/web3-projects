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

export const createWallet = async (provider, idx) => {
    if (idx === 0) {
        // 1. create a random wallet
        console.log("\nCreating a random wallet...");
        const wallet = ethers.Wallet.createRandom();
        await wallet.connect(provider);
        console.log("Address:", wallet.address);
        console.log("Private Key:", wallet.privateKey);
        console.log("Mnemonic Phrase:", wallet.mnemonic.phrase);
        return wallet;
    } else
        if (idx === 1) {
            // 2. create a wallet from a private key
            console.log("\nCreating a wallet from a private key...");
            const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
            const wallet = new ethers.Wallet(privateKey, provider)
            console.log("Address:", wallet.address);
            console.log("Private Key:", wallet.privateKey);
            console.log("Mnemonic Phrase:", wallet.mnemonic?.phrase);
            return wallet;
        } else
            if (idx === 2) {
                // 3. create a wallet from a mnemonic phrase
                console.log("\nCreating a wallet from a mnemonic phrase...");
                const mnemonicPhrase = "horror coconut base category fire secret current cricket second dog cable win";
                const wallet = ethers.Wallet.fromPhrase(mnemonicPhrase);
                await wallet.connect(provider);
                console.log("Address:", wallet.address);
                console.log("Private Key:", wallet.privateKey);
                console.log("Mnemonic Phrase:", wallet.mnemonic.phrase);
                return wallet;
            }
    return undefined;
};

const main = async () => {
    let start = Date.now();
    try {
        const rpc_url = rpc_urls[0];
        console.log(`Getting information from RPC URL: ${rpc_url}`);
        const provider = new ethers.JsonRpcProvider(rpc_url);
        const blockNumber = await provider.getBlockNumber();
        console.log("Current block number:", blockNumber);
        await createWallet(provider, 0);
        await createWallet(provider, 1);
        await createWallet(provider, 2);
    } catch (error) {
        // Code to handle the error
        console.error("An error occurred:", error.message);
    }

    let end = Date.now();
    console.log(`Execution Time: ${end - start} ms`);
};

main();