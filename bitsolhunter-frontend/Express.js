const express = require('express');
const WebSocket = require('ws');
const app = express();

// Create a WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Mock data for tokens and trades
const tokens = [
  { name: 'Solana', symbol: 'SOL', price: 35.5 },
  { name: 'Ethereum', symbol: 'ETH', price: 2500 },
];

const trades = [
  { token: 'Solana', action: 'Buy', price: 34.5, date: '2025-07-24 14:32', profit: '10%' },
  { token: 'Ethereum', action: 'Sell', price: 2450, date: '2025-07-24 13:20', profit: '5%' },
];

// WebSocket connection logic
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Send token data every 10 seconds
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'tokens', data: tokens }));
  }, 10000); // Send token data every 10 seconds

  // Send trade data every 15 seconds
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'trades', data: trades }));
  }, 15000); // Send trade data every 15 seconds
});

// API route for tokens
app.get('/api/tokens', (req, res) => {
  res.json(tokens);
});

// API route for trades
app.get('/api/trades', (req, res) => {
  res.json(trades);
});

// Upgrade HTTP to WebSocket
app.server = app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

app.server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

