// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ILRTA} from "ilrta/ILRTA.sol";
import {SignatureVerification} from "ilrta/SignatureVerification.sol";

import './libraries/FullMath.sol';
import './libraries/FixedPoint128.sol';
import './libraries/LiquidityMath.sol';

abstract contract Positions is ILRTA {
    /*<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3
                               DATA TYPES
    <3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3*/

    struct ILRTADataID {
        address owner;
        int24 tickLower;
        int24 tickUpper;
    }

    struct ILRTAData {
        // the amount of liquidity owned by this position
        uint128 liquidity;
        // fee growth per unit of liquidity as of the last update to liquidity or fees owed
        uint256 feeGrowthInside0LastX128;
        uint256 feeGrowthInside1LastX128;
        // the fees owed to the position owner in token0/token1
        uint128 tokensOwed0;
        uint128 tokensOwed1;
    }

    struct ILRTATransferDetails {
        uint128 amount;
        int24 tickLower;
        int24 tickUpper;
    }

    struct SignatureTransfer {
        uint256 nonce;
        uint256 deadline;
        ILRTATransferDetails transferDetails;
    }

    struct RequestedTransfer {
        address to;
        ILRTATransferDetails transferDetails;
    }

    /*<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3
                                STORAGE
    <3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3*/

    mapping(bytes32 id => ILRTAData data) private _dataOf;

    /*<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3
                              CONSTRUCTOR
    <3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3*/

    constructor()
        ILRTA(
            address(0),
            "Uniswap V3 Positions",
            "UNI-V3-POS",
            "TransferDetails(uint128 amount,int24 tickLower,int24 tickUpper)"
        )
    {
        name = "Uniswap V3 Positions";
        symbol = "UNI-V3-POS";
    }

    /*<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3
                                 LOGIC
    <3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3*/

    function getPosition(
        address owner,
        int24 tickLower,
        int24 tickUpper
    ) internal view returns (ILRTAData storage) {
        return _dataOf[keccak256(abi.encodePacked(owner, tickLower, tickUpper))];
    }

    /*<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3
                              ILRTA LOGIC
    <3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3*/

    function dataID(ILRTADataID calldata id) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(id.owner, id.tickLower, id.tickUpper));
    }

    function dataOf(
        bytes32 id
    ) external view returns (ILRTAData memory) {
        return _dataOf[id];
    }

    function transfer(
        address to,
        ILRTATransferDetails calldata transferDetails
    ) external returns (bool) {
        return _transfer(msg.sender, to, transferDetails);
    }

    function transferBySignature(
        address from,
        SignatureTransfer calldata signatureTransfer,
        RequestedTransfer calldata requestedTransfer,
        bytes calldata signature
    ) external returns (bool) {
        if (
            requestedTransfer.transferDetails.amount >
            signatureTransfer.transferDetails.amount ||
            signatureTransfer.transferDetails.tickLower !=
            requestedTransfer.transferDetails.tickLower || 
            signatureTransfer.transferDetails.tickUpper !=
            requestedTransfer.transferDetails.tickUpper
        ) {
            revert InvalidRequest(
                abi.encode(signatureTransfer.transferDetails)
            );
        }

        _verifySignature(from, signatureTransfer, signature);

        return
            _transfer(
                from,
                requestedTransfer.to,
                requestedTransfer.transferDetails
            );
    }

    /*<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3
                             INTERNAL LOGIC
    <3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3*/

    function _verifySignature(
        address from,
        SignatureTransfer calldata signatureTransfer,
        bytes calldata signature
    ) private {
        if (block.timestamp > signatureTransfer.deadline)
            revert SignatureExpired(signatureTransfer.deadline);

        useUnorderedNonce(from, signatureTransfer.nonce);

        bytes32 signatureHash = hashTypedData(
            keccak256(
                abi.encode(
                    TRANSFER_TYPEHASH,
                    keccak256(
                        abi.encode(
                            TRANSFER_DETAILS_TYPEHASH,
                            signatureTransfer.transferDetails
                        )
                    ),
                    msg.sender,
                    signatureTransfer.nonce,
                    signatureTransfer.deadline
                )
            )
        );

        SignatureVerification.verify(signature, signatureHash, from);
    }

    function _transfer(
        address from,
        address to,
        ILRTATransferDetails memory transferDetails
    ) internal returns (bool) {
        ILRTAData storage fromPosition = _dataOf[keccak256(abi.encodePacked(from, transferDetails.tickLower, transferDetails.tickUpper))];
        ILRTAData storage toPosition = _dataOf[keccak256(abi.encodePacked(to, transferDetails.tickLower, transferDetails.tickUpper))];

       
        // TODO: this doesn't take into account fee growth and tokens owed
        fromPosition.liquidity -= transferDetails.amount;
        toPosition.liquidity += transferDetails.amount;

        emit Transfer(from, to, abi.encode(transferDetails));

        return true;
    }

    function _updatePosition(
      ILRTAData storage self, 
      int128 liquidityDelta,
      uint256 feeGrowthInside0X128,
      uint256 feeGrowthInside1X128
    ) internal {
        ILRTAData memory _self = self;

        uint128 liquidityNext;
        if (liquidityDelta == 0) {
            require(_self.liquidity > 0, 'NP'); // disallow pokes for 0 liquidity positions
            liquidityNext = _self.liquidity;
        } else {
            liquidityNext = LiquidityMath.addDelta(_self.liquidity, liquidityDelta);
        }

        // calculate accumulated fees
        uint128 tokensOwed0 =
            uint128(
                FullMath.mulDiv(
                    feeGrowthInside0X128 - _self.feeGrowthInside0LastX128,
                    _self.liquidity,
                    FixedPoint128.Q128
                )
            );
        uint128 tokensOwed1 =
            uint128(
                FullMath.mulDiv(
                    feeGrowthInside1X128 - _self.feeGrowthInside1LastX128,
                    _self.liquidity,
                    FixedPoint128.Q128
                )
            );

        // update the position
        if (liquidityDelta != 0) self.liquidity = liquidityNext;
        self.feeGrowthInside0LastX128 = feeGrowthInside0X128;
        self.feeGrowthInside1LastX128 = feeGrowthInside1X128;
        if (tokensOwed0 > 0 || tokensOwed1 > 0) {
            // overflow is acceptable, have to withdraw before you hit type(uint128).max fees
            self.tokensOwed0 += tokensOwed0;
            self.tokensOwed1 += tokensOwed1;
        }
    }
}
