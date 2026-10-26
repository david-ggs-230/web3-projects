# Web3 DApp Demo Collection - Project Overview
> Landing page: [index.html](https://david-ggs-230.github.io/web3-projects/) (Web3 DApp Demos Landing)
> Tech stack: React 19, Wagmi v2, Viem / Ethers v6, RainbowKit / WalletConnect AppKit
> Supported chains: Sepolia, PolygonAmoy

## Directory Structure
This repository contains built static HTML dist outputs for each demo DApp, alongside full source code on GitHub.

```
web3-projects/
├── [index.html](https://david-ggs-230.github.io/web3-projects/)                     # Main landing index page (demo gallery)
├── dapp-demos/                   # DApp demo root folder
│   ├── counter‑rainbowkit‑viem/        # Dist HTML: RainbowKit + Wagmi + Viem Counter
│   ├── counter‑rainbowkit‑ethers/       # Dist HTML: RainbowKit + Wagmi + Ethers v6 Counter
│   ├── counter‑appkit‑viem/            # Dist HTML: AppKit + Wagmi + Viem Counter
│   ├── counter‑appkit‑ethers/          # Dist HTML: AppKit + Wagmi + Ethers v6 Counter
│   └── counter‑appkit‑viem‑social‑login/ # Dist HTML: AppKit Social Login(Email/Google/X/GitHub) + Wagmi + Viem Counter
└── README.md
```

## Demo Card List from Landing Page
Each entry includes **local built dist HTML entry point** and **remote GitHub source‑code link**.

| Card # | Demo Title | Key Tech | Local Dist HTML Path | GitHub Source Code |
|---|---|---|---|---|
| Card1 | Counter DApp (Viem‑Native) | React19, RainbowKit, Wagmi v2, Viem, Sepolia, PolygonAmoy | [./counter‑rainbowkit‑viem/index.html](https://david-ggs-230.github.io/web3-projects/counter-rainbowkit-viem/index.html) | [counter‑dapp‑rainbowkit‑viem](https://github.com/david-ggs-230/web3-projects/tree/main/dapp-demos/counter-dapp-rainbowkit-viem) |
| Card2 | Counter DApp (Ethers‑v6) | React19, RainbowKit, Wagmi v2, Ethers v6, Sepolia, PolygonAmoy | [./counter‑rainbowkit‑ethers/index.html](https://david-ggs-230.github.io/web3-projects/counter-rainbowkit-ethers/index.html) | [counter‑dapp‑rainbowkit‑ethers](https://github.com/david-ggs-230/web3-projects/tree/main/dapp-demos/counter-dapp-rainbowkit-ethers) |
| Card3 | Counter DApp (Viem‑Native) | React19, AppKit, Wagmi v2, Viem, Sepolia, PolygonAmoy | [./counter‑appkit‑viem/index.html](https://david-ggs-230.github.io/web3-projects/counter-appkit-viem/index.html) | [counter‑dapp‑appkit‑viem](https://github.com/david-ggs-230/web3-projects/tree/main/dapp-demos/counter-dapp-appkit-viem) |
| Card4 | Counter DApp (Ethers‑v6) | React19, AppKit, Wagmi v2, Ethers v6, Sepolia, PolygonAmoy | [./counter‑appkit‑ethers/index.html](https://david-ggs-230.github.io/web3-projects/counter-appkit-ethers/index.html) | [counter‑dapp‑appkit‑ethers](https://github.com/david-ggs-230/web3-projects/tree/main/dapp-demos/counter-dapp-appkit-ethers) |
| Card5 | Counter DApp (Viem‑Native + Social Login) | React19, AppKit, Wagmi v2, Viem, Social‑Login(Email / Google / X / GitHub), Sepolia, PolygonAmoy | [./counter‑appkit‑viem‑social/index.html](https://david-ggs-230.github.io/web3-projects/counter-appkit-viem-social/index.html) | [counter‑dapp‑appkit‑viem‑social‑login](https://github.com/david-ggs-230/web3-projects/tree/main/dapp-demos/counter-dapp-appkit-viem-social-login) |


## Feature Highlights
- Two wallet UI options: **RainbowKit** and **WalletConnect AppKit**.
- Two web3 library choices: pure **Viem‑native** or mixed **Ethers v6**.
- Card5 adds AppKit built‑in social login: Email, X(Twitter), Google, GitHub, enabling social web3 onboarding without browser wallet extension.
- All demos implement on‑chain counter: increment / decrement contract operation, transaction status feedback, compatible with Sepolia & PolygonAmoy testnet.
