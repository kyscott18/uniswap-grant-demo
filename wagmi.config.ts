import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "benchmarks/generated.ts",
  contracts: [],
  plugins: [
    foundry({
      project: "uniswap-v3/",
      include: [
        "UniswapV3Factory.sol/**",
        "UniswapV3Pool.sol/**",
        "NonfungiblePositionManager.sol/**",
      ],
    }),
    foundry({
      project: "contracts/",
      namePrefix: "ilrta",
      include: [        
        "UniswapV3Factory.sol/**",
        "UniswapV3Pool.sol/**",
        "PositionManager.sol/**",
        "MockERC20.sol/**"],
    }),
  ],
});
