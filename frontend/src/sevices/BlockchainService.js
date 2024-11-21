// BlockchainService.js

// Abstract class for Blockchain communication (interface)
export class BlockchainService {
    constructor() {
        if (this.constructor === BlockchainService) {
            throw new Error("Cannot instantiate an abstract class.");
        }
    }

    // Method to fetch votes for the move (to be implemented)
    async fetchVotes() {
        throw new Error("Method 'fetchVotes' should be implemented.");
    }

    // Method to fetch the final vote for the move (to be implemented)
    async fetchFinalVote() {
        throw new Error("Method 'fetchFinalVote' should be implemented.");
    }

    // Method to reset the board to the previous state (to be implemented)
    async resetBoardToMove() {
        throw new Error("Method 'resetBoardToMove' should be implemented.");
    }
}

// Mock BlockchainService implementation (mocking blockchain interaction)
export class MockBlockchainService extends BlockchainService {
    constructor() {
        super();
        this.mockMoves = [
            { player: "Player2", move: "b2 -> b4" },
            { player: "Player3", move: "b2 -> b4" },
        ];
    }

    // Fetch mock votes (return hardcoded moves)
    async fetchVotes() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.mockMoves); // Simulate the response delay (e.g., 5 seconds)
            }, 5000);
        });
    }

    // Simulate fetching the final vote
    async fetchFinalVote() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.mockMoves[1]); // Simulate fetching Player3's move (b3 -> b4)
            }, 0); // No delay for fetching the final vote (this can be adjusted)
        });
    }

    // Simulate resetting the board to the previous state
    async resetBoardToMove(move) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`Board reset to move: ${move}`);
            }, 1000); // Simulating delay for resetting the board
        });
    }
}
