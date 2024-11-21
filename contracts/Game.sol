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

interface IGameOracle {
    function registerRequest(string[] memory request) external;
    // function getRating(address player) external returns(uint);
}

contract Game is NilBase {
    uint public round;
    Team[] teams;
    GameResult public result;
    uint moveStart;
    uint moveTimeout;
    uint public bid;
    int public winner = -1;
    address public oracle;

    string[] movesChain;
    mapping(address => string) voters;
    mapping(string => uint) moveWeigths;
    string[] moveList;

    constructor(Team memory a, Team memory b, uint _bid, uint _moveTimeout, address _oracle) {
        teams.push(a);
        teams.push(b);
        bid = _bid;
        moveTimeout = _moveTimeout;
        moveStart = block.number;
        oracle = _oracle;
    }

    function getMoves() public view returns(string[] memory) {
        return movesChain;
    }

    function getTeamId(address player) public view returns(int) {
        for (uint i = 0; i < teams.length; i++) {
            for (uint j = 0; j < teams[i].players.length; j++) {
                if (teams[i].players[j] == player) {
                    return int(i);
                }
            }
        }
        return -1;
    }

    function getTeamsNum() public view returns(uint) {
        return teams.length;
    }

    function getTeam(uint index) public view returns(Team memory) {
        return teams[index];
    }

    function finishMove() internal {
        for (uint i = 0; i < teams[getCurrentTeamId()].players.length; i++) {
            address voter = teams[getCurrentTeamId()].players[i];
            string memory moveData = voters[voter];
            if (bytes(moveData).length != 0) {
                moveWeigths[moveData] += 1;
            }
        }
        string memory bestMove = moveList[0];
        for (uint i = 0; i < moveList.length; i++) {
            uint currWeight = moveWeigths[bestMove];
            uint weight = moveWeigths[moveList[i]];
            if (weight > currWeight) {
                bestMove = moveList[i];
            }
            delete moveWeigths[moveList[i]];
        }
        movesChain.push(bestMove);

        bytes memory callData = abi.encodeWithSelector(IGameOracle.registerRequest.selector, movesChain);

        Nil.asyncCall(oracle, address(this), 0, callData);

        IGameOracle(oracle).registerRequest(movesChain);
        moveStart = block.number;
        round++;

        delete moveList;
    }

    function voteMove(string memory move) public {
        require(bytes(move).length == 0);
        voters[msg.sender] = move;
        moveList.push(move);

        if (moveList.length == teams[getCurrentTeamId()].players.length) {
            finishMove();
        }
    }

    function getRemainingTime() public view returns(int) {
        return int(moveStart) + int(moveTimeout) - int(block.number);
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

contract ChessOracle is NilBase, IGameOracle {
    mapping(bytes32 => address[]) private requesters;
    string[][] public requests;

    function registerRequest(string[] memory moves) public {
        requests.push(moves);
        requesters[keccak256(abi.encode(moves))].push(msg.sender);
    }

    function resolveRequest(string[] memory request, GameResult result) public {
        address[] memory addrs = requesters[keccak256(abi.encode(request))];
        bytes memory res = abi.encodeWithSignature("setResultFromOracle(GameResult)", result);
        for (uint256 i = 0; i < addrs.length; i++) {
            Nil.asyncCall(addrs[i], address(this), 0, res);
        }
    }

    function getRequests() public view returns(string[][] memory) {
        return requests;
    }
}
