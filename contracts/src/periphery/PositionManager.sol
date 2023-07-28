// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import '@uniswap/v3-core/contracts/libraries/FixedPoint128.sol';
import '@uniswap/v3-core/contracts/libraries/FullMath.sol';

import './interfaces/IPositionManager.sol';
import './libraries/PositionKey.sol';
import './libraries/PoolAddress.sol';
import './base/LiquidityManagement.sol';
import './base/PeripheryImmutableState.sol';
import './base/Multicall.sol';
import './base/PeripheryValidation.sol';
import './base/SelfPermit.sol';
import './base/PoolInitializer.sol';

/// @title Position Manager
/// @notice Supports adding and removing liquidity
contract PositionManager is
    IPositionManager,
    Multicall,
    PeripheryImmutableState,
    PoolInitializer,
    LiquidityManagement,
    PeripheryValidation,
    SelfPermit
{
    constructor(
        address _factory,
        address _WETH9
    ) PeripheryImmutableState(_factory, _WETH9) { }

    /// @inheritdoc IPositionManager
    function increaseLiquidity(IncreaseLiquidityParams calldata params)
        external
        payable
        override
        checkDeadline(params.deadline)
        returns (
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
      unchecked {
  
        IUniswapV3Pool pool;
        (liquidity, amount0, amount1, pool) = addLiquidity(
            AddLiquidityParams({
                token0: params.token0,
                token1: params.token1,
                fee: params.fee,
                tickLower: params.tickLower,
                tickUpper: params.tickUpper,
                amount0Desired: params.amount0Desired,
                amount1Desired: params.amount1Desired,
                amount0Min: params.amount0Min,
                amount1Min: params.amount1Min,
                recipient: params.recipient == address(0) ? msg.sender : params.recipient
            })
        );

        emit IncreaseLiquidity(address(pool), keccak256(abi.encodePacked(params.recipient, params.tickLower, params.tickUpper)), liquidity, amount0, amount1);
      }
    }

    /// @inheritdoc IPositionManager
    function decreaseLiquidity(DecreaseLiquidityParams calldata params)
        external
        payable
        override
        checkDeadline(params.deadline)
        returns (uint256 amount0, uint256 amount1)
    {
      unchecked {
        require(params.liquidity > 0);

        // TODO: transfer position to pool
     
        IUniswapV3Pool pool = IUniswapV3Pool(PoolAddress.computeAddress(factory, PoolAddress.PoolKey(params.token0, params.token1, params.fee)));
        (amount0, amount1) = pool.burn(params.recipient,params.tickLower, params.tickUpper, params.collect);

        require(amount0 >= params.amount0Min && amount1 >= params.amount1Min, 'Price slippage check');

        emit DecreaseLiquidity(address(pool), keccak256(abi.encodePacked(msg.sender, params.tickLower, params.tickUpper)), params.liquidity, amount0, amount1);
      }
    }
}
