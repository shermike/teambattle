import chess
import subprocess
import os
import enum
import time
from typing import List


Move = str
Position = List[Move]


ORACLE_ADDRESS = os.environ["ORACLE_ADDRESS"]


class PositionResult(enum.Enum):
    NONE = 0
    INVALID = 1
    WIN = 2
    DRAW = 3


def fetch_unresolved_position() -> (Position, int):
    args = ["nil", "contract", "call-readonly", "-q", "--abi", "contracts/Game/ChessOracle.abi", ORACLE_ADDRESS, "getRequest"]
    result = subprocess.run(args, capture_output=True, text=True).stdout
    fields = result.partition(" ")[2].strip("{}\n").rsplit(" ", 2)
    position_string, address, request_id = fields[0], fields[1], int(fields[2])
    if request_id == 0:
        return None, None, None
    position_moves = position_string.strip("[]").split(" ")
    print(position_moves)
    return position_moves, address, request_id


def post_position_result(request_id: int, result: PositionResult):
    args = ["nil", "wallet", "send-message", "--abi", "contracts/Game/ChessOracle.abi", ORACLE_ADDRESS, "resolveRequest", str(request_id), str(result.value)]
    print(subprocess.run(args, capture_output=True, text=True).stdout)


def position_result(position: Position) -> PositionResult:
    board = chess.Board()
    try:
        for move in position:
            board.push_san(move)
    except chess.IllegalMoveError:
        return PositionResult.INVALID
    if board.is_checkmate():
        return PositionResult.WIN
    if board.is_stalemate() or board.is_insufficient_material():
        return PositionResult.DRAW
    return PositionResult.NONE
    


def main():
    while True:
        position, address, request_id = fetch_unresolved_position()
        if request_id is None:
            time.sleep(0.2)
            continue
        print(f"Handling request {position} from {address} with id {request_id}: ", end="", flush=True)
        result = position_result(position)
        print(result.name)
        post_position_result(request_id, result)


if __name__ == "__main__":
    main()