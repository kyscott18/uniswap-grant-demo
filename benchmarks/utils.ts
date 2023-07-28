import MockERC20 from "../contracts/out/MockERC20.sol/MockERC20.json";
import { ALICE } from "./constants.js";
import { ilrtaMockErc20ABI } from "./generated.js";
import invariant from "tiny-invariant";
import {
  type Address,
  type Hex,
  createPublicClient,
  createTestClient,
  createWalletClient,
  http,
} from "viem";
import { mainnet } from "viem/chains";
import type { Chain } from "viem/chains";

export const pool = Number(process.env.VITEST_POOL_ID ?? 1);
export const anvil = {
  ...mainnet, // We are using a mainnet fork for testing.
  id: 1, // We configured our anvil instance to use `123` as the chain id (see `globalSetup.ts`);
  rpcUrls: {
    // These rpc urls are automatically used in the transports.
    default: {
      // Note how we append the worker id to the local rpc urls.
      http: [`http://127.0.0.1:8545/${pool}`],
      webSocket: [`ws://127.0.0.1:8545/${pool}`],
    },
    public: {
      // Note how we append the worker id to the local rpc urls.
      http: [`http://127.0.0.1:8545/${pool}`],
      webSocket: [`ws://127.0.0.1:8545/${pool}`],
    },
  },
} as const satisfies Chain;

export const testClient = createTestClient({
  chain: anvil,
  mode: "anvil",
  transport: http(),
});

export const publicClient = createPublicClient({
  chain: anvil,
  transport: http(),
});

export const walletClient = createWalletClient({
  chain: anvil,
  transport: http(),
  account: ALICE,
});

export const createToken = async (): Promise<Address> => {
  const deployHash = await walletClient.deployContract({
    account: ALICE,
    abi: ilrtaMockErc20ABI,
    bytecode: MockERC20.bytecode.object as Hex,
    args: ["Mock ERC20", "MOCK", 18],
  });

  const { contractAddress } = await publicClient.waitForTransactionReceipt({
    hash: deployHash,
  });
  invariant(contractAddress);
  return contractAddress;
};

export const mint = async (token: Address, to: Address, amount: bigint) => {
  const { request } = await publicClient.simulateContract({
    abi: ilrtaMockErc20ABI,
    functionName: "mint",
    address: token,
    args: [to, amount],
    account: ALICE,
  });
  const hash = await walletClient.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash });
};

export const approve = async (
  token: Address,
  spender: Address,
  amount: bigint,
) => {
  const { request } = await publicClient.simulateContract({
    abi: ilrtaMockErc20ABI,
    functionName: "approve",
    address: token,
    args: [spender, amount],
    account: ALICE,
  });
  const hash = await walletClient.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash });
};
