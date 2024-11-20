// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@nilfoundation/smart-contracts/contracts/Nil.sol";
import "./IGame.sol"
;
contract ChessGame is GameBase {
    mapping(string => uint256) public values;

    

    function getName() external returns (string memory) {
        return "Chess";
    }


}