// Vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/web3-projects/counter-ethers/",
  build: {
    // Raises the chunk size warning threshold to 1000 KB (1 MB)
    chunkSizeWarningLimit: 1000,

    rolldownOptions: {
      output: {
        codeSplitting: {
          // Sets a default target threshold to prevent massive files
          minSize: 20000,

          groups: [
            {
              name: "wagmi-kit",
              test: /node_modules\/(?:wagmi|@rainbow-me\/rainbowkit|viem)/,
              priority: 20,
            },
            {
              name: "ethers-core",
              test: /node_modules\/ethers/,
              maxSize: 600000,
              priority: 15,
            },
            {
              name: "vendor-react",
              test: /node_modules\/(?:react|react-dom|@tanstack\/react-query|zustand)/,
              maxSize: 600000,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
