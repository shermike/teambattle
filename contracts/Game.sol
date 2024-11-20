// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@nilfoundation/smart-contracts/contracts/Nil.sol";

struct Team {
    address[] players;
}


enum GameResult {
    NONE,
    INVALID,
    WIN,
    DRAW
}

interface IGame {
    function getWinner() external returns (address);
    function getData() external returns (bytes memory);
    function getName() external returns (string memory);
    //function init(Team memory a, Team memory b) external;

    // oracle under the hood
    function getRating(address player) external returns (uint);
}

interface IGameOracle {
    function registerRequest(bytes32[] memory request) external;
    function getRating(address player) external returns(uint);
}

contract GameBase is NilBase {
    uint public round;
    Team[] teams;
    GameResult result;
    uint moveStart;
    uint bid;
    uint moveTimeout;
    int public winner = -1;
    address oracle;

    bytes32[] movesChain;
    mapping(address => bytes32) voters;
    mapping(bytes32 => uint) moveWeigths;
    bytes32[] moveList;

    constructor(Team memory a, Team memory b, uint _bid, uint _moveTimeout, address _oracle) {
        teams.push(a);
        teams.push(b);
        bid = _bid;
        moveTimeout = _moveTimeout;
        moveStart = block.number;
        oracle = _oracle;
    }

    function getTeamId(address player) public returns(uint) {
        for (uint i = 0; i < teams.length; i++) {
            for (uint j = 0; j < teams[i].players.length; j++) {
                if (teams[i].players[j] == player) {
                    return i;
                }
            }
        }
    }

    function finishMove() internal {
        for (uint i = 0; i < teams[getCurrentTeamId()].players.length; i++) {
            address voter = teams[getCurrentTeamId()].players[i];
            bytes32 moveData = voters[voter];
            if (moveData[0] == 0) {
                continue;
            }
            moveWeigths[moveData] += 1;
        }
        bytes32 bestMove = moveList[0];
        for (uint i = 0; i < moveList.length; i++) {
            uint currWeight = moveWeigths[bestMove];
            uint weight = moveWeigths[moveList[i]];
            if (weight > currWeight) {
                bestMove = moveList[i];
            }
            delete moveWeigths[moveList[i]];
        }
        movesChain.push(bestMove);

        // bytes memory context = bytes("");
        bytes memory callData = abi.encodeWithSelector(IGameOracle.registerRequest.selector, movesChain);

        // Nil.sendRequest(oracle, 0, Nil.ASYNC_REQUEST_MIN_GAS, context, callData);

        // (bytes memory returnData, bool success) = Nil.awaitCall(oracle, Nil.ASYNC_REQUEST_MIN_GAS, callData);
        // require(success);

        Nil.asyncCall(oracle, address(this), 0, callData);

        IGameOracle(oracle).registerRequest(moveList);
        moveStart = block.number;
        round++;

        delete moveList;
    }

    function voteMove(uint _round, bytes32 move) public {
        require(_round == round);
        require(voters[msg.sender][0] == 0);
        voters[msg.sender] = move;
        // moves[move].push(msg.sender);
        moveList.push(move);

        if (moveList.length == teams[getCurrentTeamId()].players.length) {
            finishMove();
        }
    }

    function getCurrentTeamId() public view returns (uint) {
        return round % teams.length;
    }

    function setResultFromOracle(GameResult _result) public {
        result = _result;
        if (result == GameResult.WIN) {
            winner = int(getCurrentTeamId());
        } else if (result == GameResult.DRAW) {
            winner = -2;
        } else if (result == GameResult.INVALID) {
            winner = int((round + 1) % teams.length);
        }
    }

    function setWinner(int id) internal {
        winner = id;
        Nil.asyncCall(
            teams[uint(id)].players[0],
            address(this),
            bid * 2,
            bytes("")
        );
    }

    function tryFinishRound() public returns(bool) {
        if (block.number >= moveTimeout + moveStart) {
            finishMove();
            return true;
        }
        return false;
    }
}

contract ChessOracle is NilBase {
    mapping(bytes32 => address[]) private requesters;
    // mapping(bytes32 => bytes) private requests;
    bytes[] public requests;

    function registerRequest(bytes memory request) public {
        requests.push(request);
        // requests[keccak256(request)] = request;
        requesters[keccak256(request)].push(msg.sender);
    }

    function resolveRequest(bytes32 request, GameResult result) public {
        address[] memory addrs = requesters[request];
        bytes memory res = abi.encodeWithSignature("setResultFromOracle(GameResult)", result);
        for (uint256 i = 0; i < addrs.length; i++) {
            Nil.asyncCall(addrs[i], address(this), 0, res);
        }
    }

    // function getRequests() public view returns (bytes[][] memory) {
    //     return requests;
    // }
}
