# Uniswap Grant Demo

Implementation of custom positions contract for Uniswap V3. This contract uses [ilrta](https://github.com/kyscott18/ilrta), a framework for creating custom but composable token standards.

## Gas Benchmarking

|                          | Uniswap V3|Uniswap V3 + ilrta|
|--------------------------|-----------|------------------|
|Add liquidity (cold)      |    295,220|           170,144|
|Add liquidity (hot)       |    144,646|           153,044|
|Remove liquidity (partial)|    171,229|                  |
|Remove liquidity (full)   |    158,917|                  |

## Function Calls

|Event            |   Count|
|-----------------|--------|
|Mint             | 585,729|
|Add liquidity    | 171,979|
|Remove liquidity | 544,659|

## Gas Savings

|Gas Price (gwei)|Gas Savings (eth)|
|----------------|-----------------|
|25              |          1,795.4|
|50              |          3,590.8|
|75              |          5,386.2|
|100             |          7,181.6|

## Recreating

Function invocation count was found using [dune analyitics](https://dune.com/queries/2780357)

### Scripts

```sh
pnpm install

pnpm build

# To run standard uniswap v3 benchmarks
pnpm bun benchmarks/uniswap-v3/index.ts

# To run ilrta + uniswap v3 benchmarks
pnpm bun benchmarks/ilrta-uniswap-v3/index.ts
```
