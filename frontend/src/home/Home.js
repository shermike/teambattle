import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

export default function Home() {
    const [privateKey, setPrivateKey] = useState('');
    const [gameAddress, setGameAddress] = useState('');
    const [walletAddress, setWalletAddress] = useState(''); // New state for wallet address
    const navigate = useNavigate(); // Create navigate function

    const handleJoin = () => {
        // Validate if all fields are filled
        if (!privateKey || !gameAddress || !walletAddress) {
            alert("Please fill in all the fields.");
            return;
        }

        // Store the entered values in localStorage
        localStorage.setItem('PRIVATE_KEY', privateKey);
        localStorage.setItem('GAME_ADDRESS', gameAddress);
        localStorage.setItem('WALLET_ADDRESS', walletAddress);

        // Redirect to the Game page
        navigate('/game'); // Redirect to the next page
    };

    return (
        <div style={styles.container}>
            <div style={styles.box}>
                <h2 style={styles.title}>Join Game</h2>

                <div style={styles.inputContainer}>
                    <label style={styles.label}>Private Key</label>
                    <input
                        type="text"
                        placeholder="Enter your private key"
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputContainer}>
                    <label style={styles.label}>Game Address</label>
                    <input
                        type="text"
                        placeholder="Enter the game address"
                        value={gameAddress}
                        onChange={(e) => setGameAddress(e.target.value)}
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputContainer}>
                    <label style={styles.label}>Wallet Address</label>
                    <input
                        type="text"
                        placeholder="Enter your wallet address"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        style={styles.input}
                    />
                </div>

                <button onClick={handleJoin} style={styles.button}>Join Game</button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f4',
    },
    box: {
        padding: '20px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        width: '300px',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '18px',
    },
    inputContainer: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontSize: '14px',
    },
    input: {
        width: '90%',
        padding: '10px',
        fontSize: '14px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    button: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};
