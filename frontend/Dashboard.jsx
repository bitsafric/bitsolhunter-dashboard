import React, { useEffect, useState } from "react";
import { getTokenData, getBotStatus } from "./api"; // corrected imports

export default function Dashboard() {
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    async function load() {
      const tokenList = await getTokenData();   // renamed to match api.js
      const statData = await getBotStatus();    // renamed to match api.js
      setTokens(tokenList || []);
      setStats(statData || {});
    }

    load();
  }, []);

  return (
    <div>
      <h1>BitSolHunter Dashboard</h1>
      <h2>Stats:</h2>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
      <h2>Tokens:</h2>
      <ul>
        {tokens.map((t, i) => (
          <li key={i}>{t.name} - {t.symbol}</li>
        ))}
      </ul>
    </div>
  );
}

