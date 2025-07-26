// src/components/ControlPanel.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ControlPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [maxSpend, setMaxSpend] = useState(0.5);
  const [maxOpen, setMaxOpen] = useState(10);
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch initial status
    axios.get('/api/bot-status')
      .then(res => setIsRunning(res.data.running))
      .catch(err => console.error('Bot status fetch error:', err));
  }, []);

  const startBot = async () => {
    setLoading(true);
    try {
      await axios.post('/api/start-bot', { maxSpend, maxOpen });
      setIsRunning(true);
    } catch (err) {
      alert('Failed to start bot');
    }
    setLoading(false);
  };

  const stopBot = async () => {
    setLoading(true);
    try {
      await axios.post('/api/stop-bot');
      setIsRunning(false);
    } catch (err) {
      alert('Failed to stop bot');
    }
    setLoading(false);
  };

  const handleManualBuy = async () => {
    if (!manualToken) return;
    try {
      await axios.post('/api/manual-buy', { token: manualToken });
      alert('Manual token buy sent');
      setManualToken('');
    } catch (err) {
      alert('Manual token buy failed');
    }
  };

  return (
    <div className="bg-zinc-900 text-white rounded-xl p-6 shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-center">🧠 Bot Control Panel</h2>

      {/* Bot Status Section */}
      <div className="flex items-center justify-between">
        <button
          className={`px-5 py-2 rounded font-semibold ${isRunning ? 'bg-red-600' : 'bg-green-600'}`}
          onClick={isRunning ? stopBot : startBot}
          disabled={loading}
        >
          {isRunning ? 'Stop Bot' : 'Start Bot'}
        </button>
        <span className={`text-sm ${isRunning ? 'text-green-400' : 'text-red-400'}`}>
          {isRunning ? 'Running' : 'Stopped'}
        </span>
      </div>

      {/* Max Spend Section */}
      <div className="space-y-2">
        <label className="text-sm">Max Spend per Token (SOL)</label>
        <input
          type="number"
          value={maxSpend}
          onChange={(e) => setMaxSpend(parseFloat(e.target.value))}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 w-32"
        />
      </div>

      {/* Max Open Positions Section */}
      <div className="space-y-2">
        <label className="text-sm">Max Open Positions</label>
        <input
          type="number"
          value={maxOpen}
          onChange={(e) => setMaxOpen(parseInt(e.target.value))}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 w-32"
        />
      </div>

      {/* Manual Token Buy Section */}
      <div className="space-y-2">
        <label className="text-sm">Manual Token Address</label>
        <input
          type="text"
          value={manualToken}
          onChange={(e) => setManualToken(e.target.value)}
          placeholder="Enter Solana token address"
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 w-full"
        />
        <button
          className="bg-blue-600 px-4 py-2 rounded mt-2 w-full"
          onClick={handleManualBuy}
        >
          Send Manual Buy
        </button>
      </div>
    </div>
  );
}

