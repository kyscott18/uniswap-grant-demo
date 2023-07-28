# Uniswap Grant Demo

Implementation of custom positions contract for Uniswap V3.

## Gas Benchmarking

|                          |Uniswap V3 |Uniswap V3 + ilrta|
|--------------------------|-----------|------------------|
|Add liquidity (cold)      |    295,220|           170,144|
|Add liquidity (hot)       |    144,646|           153,044|
|Remove liquidity (partial)|    171,229|                  |
|Remove liquidity (full)   |    158,917|                  |

## Function Calls

|Event            |Count   |
|-----------------|--------|
|Mint             | 585,729|
|Add liquidity    | 171,979|
|Remove liquidity | 544,659|

## Gas Savings
