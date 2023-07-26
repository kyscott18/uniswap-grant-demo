import { ALICE, forkBlockNumber, forkUrl } from "../constants.js";
import { approve, createToken, mint } from "../utils.js";
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

  const tokenA = await createToken();
  const tokenB = await createToken();

  const [token0, token1] =
    tokenA.toLowerCase() < tokenB.toLowerCase()
      ? [tokenA, tokenB]
      : [tokenB, tokenA];

  await mint(token0, ALICE, parseEther("10"));
  await mint(token1, ALICE, parseEther("10"));

  await approve(token0, NonfungiblePositionManagerAddress, parseEther("10"));
  await approve(token1, NonfungiblePositionManagerAddress, parseEther("10"));
  const pair = await createPair(token0, token1, 3000);

  console.log("pair address", pair);

  await shutdown();
};

addLiquidity().catch((err) => console.error(err));
