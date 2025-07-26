import { useState, useEffect } from 'react';

export default function TradeLog() {
  const [trades, setTrades] = useState([]);
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
      if (message.type === 'trades') {
        setTrades(message.data);
        setLoading(false);
      }
    };

    // Cleanup on component unmount
    return () => {
      ws.close(); // Close WebSocket connection on component unmount
    };
  }, []);

  if (loading) {
    return <div className="text-center text-white">Loading Trade Logs...</div>;
  }

  return (
    <div className="bg-zinc-800 p-4 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold">Trade Log</h3>
      <ul className="space-y-3 mt-4">
        {trades.map((trade, index) => (
          <li key={index} className="flex justify-between items-center">
            <span>{trade.token} - {trade.action}</span>
            <span className="text-yellow-400">{trade.price} USD</span>
            <span className={`text-${trade.profit.includes('-') ? 'red' : 'green'}-400`}>
              {trade.profit}
            </span>
            <span className="text-sm text-gray-400">{trade.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

