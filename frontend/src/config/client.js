import {
    HttpTransport,
    LocalECDSAKeySigner,
    PublicClient,
    WalletV1,
    convertEthToWei
} from "@nilfoundation/niljs";
import GameBaseABI from '../artifacts/GameBase.json';
import {
    ExternalMessageEnvelope,
    bytesToHex,
    hexToBytes,
    toHex,
    waitTillCompleted,
} from "@nilfoundation/niljs";
import { encodeFunctionData } from "viem";

export async function createClient() {
    // Read walletAddress, privateKey, and gameAddress from localStorage
    const walletAddress = localStorage.getItem('WALLET_ADDRESS');
    const privateKey = localStorage.getItem('PRIVATE_KEY');

    // Fetch endpoint from .env file (React uses REACT_APP_ prefix)
    const endpoint = process.env.REACT_APP_NIL_RPC_ENDPOINT;

    if (!walletAddress || !privateKey || !endpoint) {
        throw new Error("Required values are not set in localStorage or .env");
    }

    const publicClient = new PublicClient({
        transport: new HttpTransport({
            endpoint: endpoint,
        }),
    });

    const signer = new LocalECDSAKeySigner({
        privateKey: `0x${privateKey}`,
    });
    const pubkey = await signer.getPublicKey();

    const wallet = new WalletV1({
        pubkey: pubkey,
        address: walletAddress,
        client: publicClient,
        signer,
    });

    return { wallet, publicClient, signer };
}

// Utility function to make a call to the blockchain
export async function callUtilMethod(functionName, args) {
    try {
        // Create the client (get the public client, signer, and wallet)
        const { wallet, publicClient, signer } = await createClient();

        // Fetch the game address and wallet address from localStorage
        const gameAddress = localStorage.getItem('GAME_ADDRESS');
        const walletAddress = localStorage.getItem('WALLET_ADDRESS');

        if (!gameAddress || !walletAddress) {
            throw new Error("Game address or wallet address is missing in localStorage.");
        }

        // Prepare the ABI
        const abi = GameBaseABI.abi;

        // Call the contract using client.call
        const data = await publicClient.call(
            {
                to: gameAddress,  // The address of the contract
                abi,              // The contract ABI
                args: args,  // The arguments (your wallet address)
                functionName,     // The name of the function you're calling
                feeCredit: convertEthToWei(0.001),  // Optional: Use your fee calculation
            },
            "latest"  // Use the latest block
        );

        console.log(`Result of ${functionName} call:`, data);
        return data.decodedData;

    } catch (error) {
        console.error(`Error calling ${functionName}:`, error);
    }
}

/**
 * Function to vote for a move and send it to the blockchain.
 */
export async function voteForMove(move) {
    try {
        // Create the client (get the public client, signer, and wallet)
        const { wallet, publicClient, signer } = await createClient();

        // Fetch the game address and wallet address from localStorage
        const gameAddress = localStorage.getItem('GAME_ADDRESS');
        const walletAddress = localStorage.getItem('WALLET_ADDRESS');

        if (!gameAddress || !walletAddress) {
            throw new Error("Game address or wallet address is missing in localStorage.");
        }

        // Fetch the contract ABI
        const abi = GameBaseABI.abi; // Import ABI from artifacts

        // Get the current chainId
        const chainId = await publicClient.chainId();

        // Get the current sequence number for the contract
        let seqNo = await publicClient.getMessageCount(gameAddress, "latest");

        // Create the external message to vote for the move
        let message = createExternalMessage({
            contractAddress: gameAddress,
            chainId,
            seqNo,
            functionName: "voteMove",  // Function in the contract to vote for a move
            args: [move],  // Pass the move as a bytes8 argument
            abi: abi,  // ABI of the contract
        });

        // Sign the message
        message.authData = await message.sign(signer);

        // Send the message and await confirmation
        await sendAndAwait(publicClient, walletAddress, message);

        console.log("Move voted and transaction confirmed!");
    } catch (error) {
        console.error("Error voting for move:", error);
    }
}

/**
 * Helper function to create an ExternalMessageEnvelope.
 */
function createExternalMessage({
                                   contractAddress,
                                   chainId,
                                   seqNo,
                                   functionName,
                                   args,
                                   abi,
                               }) {
    return new ExternalMessageEnvelope({
        to: hexToBytes(contractAddress),
        chainId,
        seqno: seqNo,
        data: hexToBytes(encodeFunctionData({ abi, functionName, args })),
        authData: new Uint8Array(0),
        isDeploy: false,
    });
}

/**
 * Helper function to send a message and wait for confirmation.
 */
async function sendAndAwait(publicClient, walletAddress, message) {
    const encodedMessage = message.encode();
    await publicClient.sendRawMessage(bytesToHex(encodedMessage));
    await waitTillCompleted(
        publicClient,
        1,
        toHex(message.hash()),
    );
}
