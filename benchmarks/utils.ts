import TestERC20 from "../uniswap-v3/out/TestERC20.sol/TestERC20.json";
import { ALICE } from "./constants.js";
import invariant from "tiny-invariant";
import {
  type Address,
  type Hex,
  createPublicClient,
  createTestClient,
  createWalletClient,
  getAddress,
  http,
  parseEther,
} from "viem";
import { mainnet } from "viem/chains";
import type { Chain } from "viem/chains";

export const anvil = {
  ...mainnet, // We are using a mainnet fork for testing.
  id: 1, // We configured our anvil instance to use `1` as the chain id;
  rpcUrls: {
    // These rpc urls are automatically used in the transports.
    default: {
      // Note how we append the worker id to the local rpc urls.
      http: ["http://127.0.0.1:8545/"],
      webSocket: ["ws://127.0.0.1:8545/"],
    },
    public: {
      // Note how we append the worker id to the local rpc urls.
      http: ["http://127.0.0.1:8545/"],
      webSocket: ["ws://127.0.0.1:8545/"],
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

// export const createToken = async (): Promise<Address> => {
//   console.log("inini");
//   const deployHash = await walletClient.deployContract({
//     account: ALICE,
//     abi: testErc20ABI,
//     bytecode: TestERC20.bytecode.object as Hex,
//     args: [parseEther("10")],
//   });
//   console.log(1);

//   const { contractAddress } = await publicClient.waitForTransactionReceipt({
//     hash: deployHash,
//   });
//   invariant(contractAddress);
//   return getAddress(contractAddress);
// };

// export const approve = async (
//   token: Address,
//   spender: Address,
//   amount: bigint,
// ) => {
//   const { request } = await publicClient.simulateContract({
//     abi: testErc20ABI,
//     functionName: "approve",
//     address: token,
//     args: [spender, amount],
//     account: ALICE,
//   });
//   const hash = await walletClient.writeContract(request);
//   await publicClient.waitForTransactionReceipt({ hash });
// };
