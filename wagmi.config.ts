import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "benchmarks/generated.ts",
  contracts: [],
  plugins: [
    foundry({
      project: "uniswap-v3/",
      include: ["UniswapV3Factory.sol/**", "NonfungiblePositionManager.sol/**"],
    }),
    foundry({
      project: "contracts/",
      include: ["MockERC20.sol/**/"],
    }),
  ],
});
