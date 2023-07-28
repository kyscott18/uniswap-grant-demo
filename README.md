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
|25              |          1,831.5|
|50              |          3,663.0|
|75              |          5,494.5|
|100             |          7,326.1|
