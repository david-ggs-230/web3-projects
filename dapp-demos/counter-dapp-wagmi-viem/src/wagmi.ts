import { getDefaultConfig } from "@rainbow-me/rainbowkit";

import { http } from "wagmi";
import { sepolia, polygonAmoy } from "wagmi/chains";

export const config = getDefaultConfig({
  //export const config = createConfig({
  appName: "RainbowKit Wagmi App",
  projectId: "94d9861d16f29ff196678f449668ed6a",
  ssr: false,
  chains: [sepolia, polygonAmoy],
  transports: {
    [sepolia.id]: http(),
    [polygonAmoy.id]: http(),
  },
});
