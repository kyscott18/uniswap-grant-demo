import PositionManager from "../../contracts/out/PositionManager.sol/PositionManager.json"
import UniswapV3Factory from "../../contracts/out/UniswapV3Factory.sol/UniswapV3Factory.json"
import { ALICE } from "../constants.js";
import { ilrtaPositionManagerABI, ilrtaUniswapV3FactoryABI } from "../generated.js";
import { publicClient, walletClient } from "../utils.js";
import invariant from "tiny-invariant";
import {
  type Address,
  type Hex,
  type TransactionReceipt,
  getAddress,
  zeroAddress,
} from "viem";

export const createFactory = async (): Promise<Address> => {
  const deployHash = await walletClient.deployContract({
    account: ALICE,
    abi: ilrtaUniswapV3FactoryABI,
    bytecode: UniswapV3Factory.bytecode.object as Hex,
  });

  const { contractAddress } = await publicClient.waitForTransactionReceipt({
    hash: deployHash,
  });
  invariant(contractAddress);
  return contractAddress;
};

export const createPositionManager= async (factoryAddress: Address): Promise<Address> => {
  const deployHash = await walletClient.deployContract({
    account: ALICE,
    abi: ilrtaPositionManagerABI,
    bytecode: PositionManager.bytecode.object as Hex,
    args: [factoryAddress,zeroAddress]
  });

  const { contractAddress } = await publicClient.waitForTransactionReceipt({
    hash: deployHash,
  });
  invariant(contractAddress);
  return contractAddress;
};


export const createPair = async (
  positionManagerAddress: Address,
  token0: Address,
  token1: Address,
  fee: number,
): Promise<Address> => {
  const { request, result } = await publicClient.simulateContract({
    abi: ilrtaPositionManagerABI,
    functionName: "createAndInitializePoolIfNecessary",
    address: positionManagerAddress,
    args: [token0, token1, fee, 2n ** 96n],
    account: ALICE,
    value: 0n,
  });
  const hash = await walletClient.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash });
  return getAddress(result);
};

export const addLiquidity = async (
  positionManagerAddress: Address,
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
  liquidity: bigint;
}> => {
  const { request, result } = await publicClient.simulateContract({
    abi: ilrtaPositionManagerABI,
    functionName: "increaseLiquidity",
    address: positionManagerAddress,
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
  return { receipt, liquidity: result[0] };
};

export const removeLiqudity = async (
  positionManagerAddress: Address,
  token0: Address,
  token1: Address,
  fee: number,
  tickLower: number,
  tickUpper: number,
  liquidity: bigint,
  deadline: bigint,
  to: Address,
): Promise<{
  receipt: TransactionReceipt;
}> => {
  const { request } = await publicClient.simulateContract({
    abi: ilrtaPositionManagerABI,
    functionName: "decreaseLiquidity",
    address: positionManagerAddress,
    args: [{token0, token1, fee, tickLower, tickUpper, deadline, liquidity, recipient: to, collect: true, amount0Min: 0n, amount1Min: 0n}],
    account: ALICE,
    value: 0n,
  });
  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { receipt };
};
