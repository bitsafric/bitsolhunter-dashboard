import { useState, useEffect } from 'react';

export default function TokenList() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const ws = new WebSocket('ws://localhost:5000'); // Connect to WebSocket server

  useEffect(() => {
    // WebSocket connection opened
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    // Handle incoming messages from WebSocket server
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'tokens') {
        setTokens(message.data);
        setLoading(false);
      }
    };

    // Cleanup on component unmount
    return () => {
      ws.close(); // Close WebSocket connection on component unmount
    };
  }, []);

  if (loading) {
    return <div className="text-center text-white">Loading Tokens...</div>;
  }

  return (
    <div className="bg-zinc-800 p-4 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold">Tracked Tokens</h3>
      <ul className="space-y-3 mt-4">
        {tokens.map((token, index) => (
          <li key={index} className="flex justify-between items-center">
            <span>{token.name} ({token.symbol})</span>
            <span className="text-green-400">{token.price} USD</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

