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


def fetch_unresolved_positions() -> List[Position]:
    args = ["nil", "contract", "call-readonly", "-q", "--abi", "contracts/Game/ChessOracle.abi", ORACLE_ADDRESS, "getRequests"]
    result = subprocess.run(args, capture_output=True, text=True).stdout
    position_strings = result.partition(" ")[2].strip("[]\n").split("]] [[")
    positions = []
    for position_string in position_strings:
        position_encoded_moves_strings = position_string.split("] [")
        position_moves = []
        for move_encoded_string in position_encoded_moves_strings:
            move_string = ""
            for move_byte in map(lambda x: int(x), move_encoded_string.split(" ")):
                if move_byte == 0:
                    break
                move_string += chr(move_byte)
            position_moves.append(move_string)
        positions.append(position_moves)
    return positions


def encode_move(move: Move) -> str:
    l = list(move.encode("utf-8"))
    while len(l) < 8:
        l.append(0)
    return "".join(f"{b:02x}" for b in l)


def encode_position(position: Position) -> str:
    return ",".join(encode_move(move) for move in position)


def post_position_result(position: Position, result: PositionResult):
    args = ["nil", "wallet", "send-message", "--abi", "contracts/Game/ChessOracle.abi", ORACLE_ADDRESS, "resolveRequest", encode_position(position), str(result.value)]
    print(subprocess.run(args, capture_output=True).stdout)


def position_result(position: Position) -> PositionResult:
    board = chess.Board()
    for move in position:
        board.push_uci(move)
        if not board.is_valid():
            return INVALID
    if board.is_checkmate():
        return WIN
    if board.is_stalemate() or board.is_insufficient_material():
        return DRAW
    return NONE
    


def main():
    while True:
        for position in fetch_unresolved_positions():
            result = position_result(position)
            post_position_result(position, result)
        time.sleep(0.1)


if __name__ == "__main__":
    main()