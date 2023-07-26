import { forkBlockNumber, forkUrl } from "../constants.js";
import { approve, createToken } from "../utils.js";
import { NonfungiblePositionManagerAddress, createPair } from "./utils.js";
import { startProxy } from "@viem/anvil";
import { parseEther } from "viem";

export const addLiquidity = async () => {
  const shutdown = await startProxy({
    port: 8545, // By default, the proxy will listen on port 8545.
    host: "::", // By default, the proxy will listen on all interfaces.
    options: {
      chainId: 1,
      forkUrl,
      forkBlockNumber,
    },
  });
  console.log("her");
  const [tokenA, tokenB] = await Promise.all([createToken(), createToken()]);

  const [token0, token1] =
    tokenA.toLowerCase() < tokenB.toLowerCase()
      ? [tokenA, tokenB]
      : [tokenB, tokenA];
  console.log("ji");
  const [, , pair] = await Promise.all([
    approve(token0, NonfungiblePositionManagerAddress, parseEther("10")),
    approve(token1, NonfungiblePositionManagerAddress, parseEther("10")),
    createPair(token0, token1, 3000),
  ]);

  console.log("pair address", pair);

  await shutdown();
};

addLiquidity().catch((err) => console.error(err));
