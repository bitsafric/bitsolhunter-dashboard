import React, { useEffect, useState } from "react";
import { fetchTokenData, fetchBotStats, getWalletBalance } from "./api";

export default function Dashboard() {
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState({});
  const [walletBalance, setWalletBalance] = useState(0);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const walletAddress = "YOUR_WALLET_ADDRESS_HERE"; // Replace this dynamically later

  useEffect(() => {
    async function load() {
      const tokenList = await fetchTokenData();
      const statData = await fetchBotStats();
      const balance = await getWalletBalance(walletAddress);

      setTokens(tokenList);
      setStats(statData);
      setWalletBalance(balance);
      setButtonEnabled(balance >= 30);
    }

    load();
  }, []);

  const handlePayment = () => {
    // Your fee payment logic here
    alert("Fee payment initiated!");
  };

  return (
    <div>
      <h1>BitSolHunter Dashboard</h1>

      <h2>Bot Stats:</h2>
      <pre>{JSON.stringify(stats, null, 2)}</pre>

      <h2>Tokens:</h2>
      <ul>
        {tokens.map((t, i) => (
          <li key={i}>
            {t.name} - {t.symbol}
          </li>
        ))}
      </ul>

      <hr />

      <h2>Wallet Access</h2>
      <p>Connected wallet: {walletAddress}</p>
      <p>Wallet Balance: {walletBalance} SOL</p>

      {buttonEnabled ? (
        <button onClick={handlePayment}>Pay Fee</button>
      ) : (
        <p>Insufficient funds to pay the access fee (30 SOL required)</p>
      )}
    </div>
  );
}

