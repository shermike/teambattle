import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";  // Import chess.js for game logic
import { Chessboard } from "react-chessboard";  // Import react-chessboard for UI
import { Audio } from 'react-loader-spinner'; // Import spinner component from react-loader-spinner

// Import the MockBlockchainService
import { MockBlockchainService } from '../sevices/BlockchainService';

// Mock teams and players
const mockTeams = {
    white: {
        name: "White Team",
        players: [
            { name: "Player White 1", wallet: "0x123", moves: [] },
            { name: "Player White 2", wallet: "0x124", moves: [] },
            { name: "Player White 3", wallet: "0x125", moves: [] },
        ],
    },
    black: {
        name: "Black Team",
        players: [
            { name: "Player Black 1", wallet: "0x126", moves: [] },
        ],
    },
};

export default function App() {
    const [game, setGame] = useState(new Chess());  // Create a new Chess instance
    const [position, setPosition] = useState(game.fen());  // FEN (board state)
    const [teamTurn, setTeamTurn] = useState("white");  // Team that has the current turn
    const [MoveDetails, setMoveDetails] = useState([]); // Store player name/address and move
    const [timer, setTimer] = useState(25); // Timer for waiting for votes (25 seconds)
    const [spinnerVisible, setSpinnerVisible] = useState(false); // Manage spinner visibility
    const blockchainService = new MockBlockchainService();
    const [initialGameState, setInitialGameState] = useState(null); // Store initial state before the move

    // Start the 25-second timer when a team's turn starts
    useEffect(() => {
        if (teamTurn) {
            setTimer(25); // Reset timer when the turn starts
        }
    }, [teamTurn]);

    // Handle the timer countdown
    useEffect(() => {
        if (timer === 0) {
            // Timer ends: switch turn to the other team
            setSpinnerVisible(false); // Hide spinner
            setTeamTurn(teamTurn === "white" ? "black" : "white");

            // Fetch the final vote and reset the board
            fetchFinalVoteAndUpdateBoard();
            return;
        }

        const interval = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1);
        }, 1000);

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [timer]);

    const onDrop = (sourceSquare, targetSquare) => {
        setInitialGameState(game.fen())
        if (teamTurn !== "white") {
            alert("Not your turn!");
            return false;
        }

        const move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q", // Promote pawn to queen
        });

        if (move === null) {
            alert("Invalid move!");
            return false;
        }

        // Update position and add the move to the details
        setPosition(game.fen());
        const moveFormatted = `${move.from} -> ${move.to}`;
        setMoveDetails((prev) => [
            ...prev,
            { name: mockTeams.white.players[0].name, wallet: "0x123", move: moveFormatted },
        ]);

        // Show spinner and process other votes
        setSpinnerVisible(true);
        pollForVotes();

        return true;
    };

    // Function to simulate polling for Player 2's and Player 3's moves
    const pollForVotes = async () => {
        // Add Player 2's move after 2 seconds
        setTimeout(async () => {
            const votes = await blockchainService.fetchVotes();
            const player2Move = votes[0];
            setMoveDetails((prev) => [
                ...prev,
                { name: "Player White 2", wallet: "0x124", move: player2Move.move },
            ]);
        }, 2000);

        // Add Player 3's move after another 5 seconds
        setTimeout(async () => {
            const votes = await blockchainService.fetchVotes();
            const player3Move = votes[1];
            setMoveDetails((prev) => [
                ...prev,
                { name: "Player White 3", wallet: "0x125", move: player3Move.move },
            ]);
        }, 5000);
    };

    // Fetch final vote and reset the board to the move chosen by the team
    const fetchFinalVoteAndUpdateBoard = async () => {
        try {
            const finalMove = await blockchainService.fetchFinalVote(); // Fetch the final move
            console.log("Final Move:", finalMove);

            // Check if finalMove and finalMove.move are valid
            if (!finalMove || !finalMove.move) {
                console.error("Invalid move received from blockchain:", finalMove);
                return; // Return early if the move is invalid
            }
            // Add to MoveDetails
            setMoveDetails((prev) => [
                ...prev,
                { name: finalMove.player, wallet: "N/A", move: finalMove.move },
            ]);

            // Now apply the move to the chessboard.
            // The move is returned as "b3 -> b4", so we need to split it into the "from" and "to" squares
            const [fromSquare, toSquare] = finalMove.move.split(' -> ');

            // Use the makeAMove function to apply the move (this prevents invalid moves)
            const move = makeAMove({
                from: fromSquare,
                to: toSquare,
            });

            // If move is invalid, show an error
            if (!move) {
                alert("Invalid move!"); // Handle invalid move
                return;
            }

        } catch (error) {
            console.error("Error in fetchFinalVoteAndUpdateBoard:", error);
        }
    };

    function makeAMove(move) {
        // Clone the game by creating a new instance and loading the current state using FEN
        const gameCopy = new Chess(initialGameState);

        // Try to make the move on the copied game state
        const result = gameCopy.move(move);

        // Check if the move is valid
        if (result === null) {
            return null;
        }

        setGame(gameCopy);
        setPosition(gameCopy.fen());
        return result; // Return the move result
    }


    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            {/* Chessboard container */}
            <div style={{ flex: "0 0 auto", marginRight: "20px", position: "relative" }}>
                <Chessboard
                    position={position}
                    onPieceDrop={onDrop}
                    boardWidth={885}
                />
                {spinnerVisible && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <div>
                            <Audio height="80" width="80" color="white" />
                            <p style={{ color: "white", marginTop: "10px" }}>
                                Waiting for others to pick the move...
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <div style={{ flex: "1", padding: "30px", backgroundColor: "#1d1f21", color: "white", borderLeft: "3px solid #ccc", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                    <h2 style={{ textAlign: "center" }}>Game Mode: 1 vs 3</h2>
                    <h3 style={{ textAlign: "center" }}>{teamTurn === "white" ? "White's Turn" : "Black's Turn"}</h3>
                    <p style={{ textAlign: "center", marginTop: "20px" }}>
                        <strong>Time Remaining: {timer} seconds</strong>
                    </p>

                    <div>
                        <h4>White Team:</h4>
                        <ul>
                            {mockTeams.white.players.map((player) => (
                                <li key={player.wallet}>{player.name} ({player.wallet})</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4>Black Team:</h4>
                        <ul>
                            {mockTeams.black.players.map((player) => (
                                <li key={player.wallet}>{player.name} ({player.wallet})</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Display moves */}
                <div>
                    <h4>Voted Moves:</h4>
                    {MoveDetails.map((detail, index) => (
                        <p key={index}>
                            {detail.name} ({detail.wallet}) played: <strong>{detail.move}</strong>
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}
