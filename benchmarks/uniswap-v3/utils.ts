import { ALICE } from "../constants.js";
import { nonfungiblePositionManagerABI } from "../generated.js";
import { publicClient, walletClient } from "../utils.js";
import {
  type Address,
  type TransactionReceipt,
  encodeAbiParameters,
  encodeFunctionData,
  getAbiItem,
  getAddress,
  parseEther,
} from "viem";

export const UniswapV3FactoryAddress =
  "0x1F98431c8aD98523631AE4a59f267346ea31F984";

export const NonfungiblePositionManagerAddress =
  "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

export const createPair = async (
  token0: Address,
  token1: Address,
  fee: number,
): Promise<Address> => {
  const { request, result } = await publicClient.simulateContract({
    abi: nonfungiblePositionManagerABI,
    functionName: "createAndInitializePoolIfNecessary",
    address: NonfungiblePositionManagerAddress,
    args: [token0, token1, fee, 2n ** 96n],
    account: ALICE,
    value: 0n,
  });
  const hash = await walletClient.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash });
  return getAddress(result);
};

export const mint = async (
  token0: Address,
  token1: Address,
  fee: number,
  tickLower: number,
  tickUpper: number,
  amount0Desired: bigint,
  amount1Desired: bigint,
  recipient: Address,
  deadline: bigint,
): Promise<{
  receipt: TransactionReceipt;
  tokenId: bigint;
  liquidity: bigint;
}> => {
  const { request, result } = await publicClient.simulateContract({
    abi: nonfungiblePositionManagerABI,
    functionName: "mint",
    address: NonfungiblePositionManagerAddress,
    args: [
      {
        token0,
        token1,
        fee,
        tickLower,
        tickUpper,
        amount0Desired,
        amount1Desired,
        amount0Min: 0n,
        amount1Min: 0n,
        recipient,
        deadline,
      },
    ],
    account: ALICE,
    value: 0n,
  });
  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { receipt, tokenId: result[0], liquidity: result[1] };
};

export const addLiquidity = async (
  tokenId: bigint,
  amount0Desired: bigint,
  amount1Desired: bigint,
  deadline: bigint,
): Promise<{
  receipt: TransactionReceipt;
  liquidity: bigint;
}> => {
  const { request, result } = await publicClient.simulateContract({
    abi: nonfungiblePositionManagerABI,
    functionName: "increaseLiquidity",
    address: NonfungiblePositionManagerAddress,
    args: [
      {
        tokenId,
        amount0Desired,
        amount1Desired,
        amount0Min: 0n,
        amount1Min: 0n,
        deadline,
      },
    ],
    account: ALICE,
    value: 0n,
  });
  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { receipt, liquidity: result[0] };
};

export const removeLiqudity = async (
  tokenId: bigint,
  liquidity: bigint,
  deadline: bigint,
  to: Address,
): Promise<{
  receipt: TransactionReceipt;
}> => {
  const decreaseData = encodeFunctionData({
    abi: nonfungiblePositionManagerABI,
    functionName: "decreaseLiquidity",
    args: [{ tokenId, liquidity, deadline, amount0Min: 0n, amount1Min: 0n }],
  });
  const collectData = encodeFunctionData({
    abi: nonfungiblePositionManagerABI,
    functionName: "collect",
    args: [
      {
        recipient: to,
        tokenId,
        amount0Max: parseEther("10"),
        amount1Max: parseEther("10"),
      },
    ],
  });

  const { request } = await publicClient.simulateContract({
    abi: nonfungiblePositionManagerABI,
    functionName: "multicall",
    address: NonfungiblePositionManagerAddress,
    args: [[decreaseData, collectData]],
    account: ALICE,
    value: 0n,
  });
  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { receipt };
};

export const burn = async (
  tokenId: bigint,
  liquidity: bigint,
  deadline: bigint,
  to: Address,
) => {
  const decreaseData = encodeFunctionData({
    abi: nonfungiblePositionManagerABI,
    functionName: "decreaseLiquidity",
    args: [{ tokenId, liquidity, deadline, amount0Min: 0n, amount1Min: 0n }],
  });
  const collectData = encodeFunctionData({
    abi: nonfungiblePositionManagerABI,
    functionName: "collect",
    args: [
      {
        recipient: to,
        tokenId,
        amount0Max: parseEther("10"),
        amount1Max: parseEther("10"),
      },
    ],
  });
  const burnData = encodeFunctionData({
    abi: nonfungiblePositionManagerABI,
    functionName: "burn",
    args: [tokenId],
  });

  const { request } = await publicClient.simulateContract({
    abi: nonfungiblePositionManagerABI,
    functionName: "multicall",
    address: NonfungiblePositionManagerAddress,
    args: [[decreaseData, collectData, burnData]],
    account: ALICE,
    value: 0n,
  });
  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { receipt };
};
