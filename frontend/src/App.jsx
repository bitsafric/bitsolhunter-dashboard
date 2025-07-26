import React, { useEffect, useState } from "react";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  // Connect to Phantom
  const connectPhantom = async () => {
    try {
      const provider = window?.solana;
      if (!provider || !provider.isPhantom) {
        alert("Phantom wallet not found! Install it first.");
        return;
      }
      const res = await provider.connect();
      setWalletAddress(res.publicKey.toString());
    } catch (err) {
      console.error("Phantom connection error:", err);
    }
  };

  // Connect to Solflare
  const connectSolflare = async () => {
    try {
      const provider = window?.solflare;
      if (!provider || !provider.isSolflare) {
        alert("Solflare wallet not found! Install it first.");
        return;
      }
      await provider.connect();
      const pubkey = provider.publicKey;
      setWalletAddress(pubkey?.toString());
    } catch (err) {
      console.error("Solflare connection error:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Welcome to BitSolHunter</h1>
      <p>Access fee required: $30 in SOL, USDC, or USDT</p>
      <br />
      {!walletAddress ? (
        <>
          <button onClick={connectPhantom} style={buttonStyle}>
            Connect with Phantom
          </button>
          <button onClick={connectSolflare} style={buttonStyle}>
            Connect with Solflare
          </button>
        </>
      ) : (
        <p>Connected wallet: <strong>{walletAddress}</strong></p>
      )}
    </div>
  );
}

const buttonStyle = {
  padding: "12px 24px",
  margin: "10px",
  fontSize: "16px",
  cursor: "pointer",
  borderRadius: "8px",
  border: "1px solid #444",
  background: "#f0f0f0",
};

export default App;

