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
//Transfer ETH on Ethereum Testnet Sepolia or local hardhat node
const sendETH = async (wallet, addressTo, ethValue) => {
    let start = Date.now();
    try {
        // Create a transaction object with the recipient's address and the amount of ETH to send
        const tx = {
            to: addressTo,
            value: ethers.parseEther(ethValue) // Convert the ETH value to Wei
        };
        const receipt = await wallet.sendTransaction(tx);
        await receipt.wait() // Wait for the transaction to be mined
        console.log("Transaction receipt:", receipt);

    } catch (error) {
        // Code to handle the error
        console.error("An error occurred:", error.message);
    }

    let end = Date.now();
    console.log(`Execution Time: ${end - start} ms`);
}
const createWalletFromPrivateKey = async (provider, privateKey) => {
    console.log("\nCreating a wallet from a private key...");
    return new ethers.Wallet(privateKey, provider);
};

const main = async () => {
    let start = Date.now();
    try {
        const rpc_url = rpc_urls[4];

        console.log(`Getting information from RPC URL: ${rpc_url}`);
        const provider = new ethers.JsonRpcProvider(rpc_url);
        const blockNumber = await provider.getBlockNumber();
        console.log("Current block number:", blockNumber);
        //local hardhat node account #1
        const wallet = await createWalletFromPrivateKey(provider, "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
        //local hardhat node account #19
        const addressFrom = wallet.address;
        const addressTo = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
        const balance01_Before = await provider.getBalance(addressFrom);
        const balance02_Before = await provider.getBalance(addressTo);
        await sendETH(wallet, addressTo, "100.5");
        const balance01_After = await provider.getBalance(addressFrom);
        const balance02_After = await provider.getBalance(addressTo);
        console.log(`Balance of ${addressFrom} before transfer: ${ethers.formatEther(balance01_Before)} ETH`);
        console.log(`Balance of ${addressTo} before transfer: ${ethers.formatEther(balance02_Before)} ETH`);
        console.log(`Balance of ${addressFrom} after transfer: ${ethers.formatEther(balance01_After)} ETH`);
        console.log(`Balance of ${addressTo} after transfer: ${ethers.formatEther(balance02_After)} ETH`);
    } catch (error) {
        // Code to handle the error
        console.error("An error occurred:", error.message);
    }

    let end = Date.now();
    console.log(`Execution Time: ${end - start} ms`);
};

main();