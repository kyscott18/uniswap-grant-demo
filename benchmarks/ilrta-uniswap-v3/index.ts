import { ALICE, BOB, forkBlockNumber, forkUrl } from "../constants.js";
import { approve, createToken, mint, publicClient } from "../utils.js";
import {
  addLiquidity,
  createFactory,
  createPair,
  createPositionManager,
  removeLiqudity as pairRemoveLiquidity,
} from "./utils.js";
import { startProxy } from "@viem/anvil";
import { parseEther, zeroAddress } from "viem";

export const main = async () => {
  const shutdown = await startProxy({
    port: 8545, // By default, the proxy will listen on port 8545.
    host: "::", // By default, the proxy will listen on all interfaces.
    options: {
      chainId: 1,
      forkUrl,
      forkBlockNumber,
      codeSizeLimit: 0x10000,
    },
  });

  const factory = await createFactory();

  const positionManager = await createPositionManager(factory);

  const block = await publicClient.getBlock();

  const tokenA = await createToken();
  const tokenB = await createToken();

  const [token0, token1] =
    tokenA.toLowerCase() < tokenB.toLowerCase()
      ? [tokenA, tokenB]
      : [tokenB, tokenA];

  await mint(token0, ALICE, parseEther("10"));
  await mint(token1, ALICE, parseEther("10"));

  await approve(token0, positionManager, parseEther("10"));
  await approve(token1, positionManager, parseEther("10"));
  await createPair(positionManager,token0, token1, 3000);

  await addLiquidity(
    positionManager,
    token0,
    token1,
    3000,
    0,
    60,
    parseEther("1"),
    parseEther("1"),
    BOB,
    block.timestamp + 100n,
  );

  const {receipt: addLiquidityColdReceipt} = await addLiquidity(
    positionManager,
    token0,
    token1,
    3000,
    0,
    60,
    parseEther("1"),
    parseEther("1"),
    zeroAddress,
    block.timestamp + 100n,
  );
  console.log("add liquidity cold gas:", addLiquidityColdReceipt.gasUsed);

  const {receipt: addLiquidityHotReceipt} = await addLiquidity(
    positionManager,
    token0,
    token1,
    3000,
    0,
    60,
    parseEther("1"),
    parseEther("1"),
    zeroAddress,
    block.timestamp + 100n,
  );
  console.log("add liquidity hotgas:", addLiquidityHotReceipt.gasUsed);


  // const {
  //   receipt: mintReceipt,
  //   tokenId,
  //   liquidity: mintLiquidity,
  // } = await pairMint(
  //   token0,
  //   token1,
  //   3000,
  //   0,
  //   60,
  //   parseEther("1"),
  //   parseEther("1"),
  //   ALICE,
  //   block.timestamp + 100n,
  // );
  // console.log("mint gas:", mintReceipt.gasUsed);

  // const { receipt: addLiquidityReceipt, liquidity: addLiquidity } =
  //   await pairAddLiquidity(
  //     tokenId,
  //     parseEther("1"),
  //     parseEther("1"),
  //     block.timestamp + 100n,
  //   );
  // console.log("add liquidity gas:", addLiquidityReceipt.gasUsed);

  // const { receipt: removeLiquidityReceipt } = await pairRemoveLiquidity(
  //   tokenId,
  //   addLiquidity,
  //   block.timestamp + 100n,
  //   ALICE,
  // );
  // console.log("remove liquidity partial gas:", removeLiquidityReceipt.gasUsed);

  // const { receipt: burnReceipt } = await pairRemoveLiquidity(
  //   tokenId,
  //   mintLiquidity,
  //   block.timestamp + 100n,
  //   ALICE,
  // );
  // console.log("remove liquidity full gas:", burnReceipt.gasUsed);

  await shutdown();
};

main().catch((err) => console.error(err));
