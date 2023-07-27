# Uniswap Grant Demo

Implementation of custom positions contract for Uniswap V3.

## Gas Benchmarking

|                          |Uniswap V3 |Uniswap V3 + ilrta|
|--------------------------|-----------|------------------|
|Add liquidity (cold)      |    295,220|                  |
|Add liquidity (hot)       |    144,646|                  |
|Remove liquidity (partial)|    171,229|                  |
|Remove liquidity (full)   |    158,917|                  |

## Event count

|Event            |Count   |
|-----------------|--------|
|Add liquidity    | 703,802|
|Remove liquidity | 522,171|
