// src/Dashboard.js
import React, { useState, useEffect } from 'react';
import { getBotStatus, getTokenData } from './api'; // Import the API 
functions

const Dashboard = () => {
  const [botStatus, setBotStatus] = useState(null);
  const [tokens, setTokens] = useState([]);

  // Fetch bot status and token data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const botStatusData = await getBotStatus();
      const tokenData = await getTokenData();
      setBotStatus(botStatusData);
      setTokens(tokenData);
    };

    fetchData();
  }, []); // Empty array ensures this runs only once, when the component 
mounts

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Display bot status */}
      <div>
        <h2>Bot Status</h2>
        {botStatus ? (
          <pre>{JSON.stringify(botStatus, null, 2)}</pre>
        ) : (
          <p>Loading bot status...</p>
        )}
      </div>

      {/* Display token data */}
      <div>
        <h2>Tokens</h2>
        {tokens.length ? (
          <ul>
            {tokens.map((token) => (
              <li key={token.id}>{token.name}</li>
            ))}
          </ul>
        ) : (
          <p>Loading tokens...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

