// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "src/MockERC20.sol";
import {UniswapV3Factory} from "src/core/UniswapV3Factory.sol";
import {PositionManager} from "src/periphery/PositionManager.sol";
import {IPositionManager} from "src/periphery/interfaces/IPositionManager.sol";

contract IncreaseLiquidityTest is Test {
  MockERC20 private token0;
  MockERC20 private token1;
  UniswapV3Factory private factory;
  PositionManager private positionManager;

  function setUp() external {
    MockERC20 tokenA = new MockERC20("Mock ERC20", "MOCK", 18);
    MockERC20 tokenB = new MockERC20("Mock ERC20", "MOCK", 18);
    (token0, token1) = address(tokenA) < address(tokenB) ? (tokenA, tokenB) : (tokenB, tokenA);
    factory = new UniswapV3Factory();
    positionManager = new PositionManager(address(factory), address(0));

    token0.mint(address(this), 10e18);
    token1.mint(address(this), 10e18);

    token0.approve(address(positionManager), 10e18);
    token1.approve(address(positionManager), 10e18);

    positionManager.createAndInitializePoolIfNecessary(address(token0), address(token1), 3000, 2**96);
  }

  function testIncreaseLiquidity() external {
    positionManager.increaseLiquidity(IPositionManager.IncreaseLiquidityParams(address(token0), address(token1),3000, 0, 60, 1e18, 1e18, 0, 0, address(this), block.timestamp + 1 ));
  }

}