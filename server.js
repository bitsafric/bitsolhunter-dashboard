require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'BitSolHunter backend is alive' });
});

// ✅ Payment verification endpoint
app.post('/verify-payment', async (req, res) => {
  const { wallet } = req.body;

  if (!wallet) {
    return res.status(400).json({ error: 'Wallet address required' });
  }

  try {
    const heliusApiKey = process.env.HELIUS_API_KEY;

    if (!heliusApiKey) {
      return res.status(500).json({ error: 'Helius API key not configured' 
});
    }

    const url = 
`https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${heliusApiKey}`;
    const response = await axios.get(url);
    const transactions = response.data;

    const isPaid = transactions.some(tx =>
      // Check if any native transfer is ≥ 30 SOL (1 SOL = 1e9 lamports)
      (tx.nativeTransfers?.some(t => t.amount >= 30 * 1e9)) ||
      // Check if any token transfer (USDT/USDC) is ≥ 30
      (tx.tokenTransfers?.some(t =>
        ['USDT', 'USDC'].includes(t.tokenSymbol?.toUpperCase()) &&
        parseFloat(t.tokenAmount?.uiAmountString || 0) >= 30
      ))
    );

    if (isPaid) {
      return res.status(200).json({ verified: true });
    } else {
      return res.status(403).json({ verified: false, message: 'No valid $30 payment found' });
    }

  } catch (error) {
    console.error(error.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🟢 BitSolHunter backend is running at 
http://localhost:${port}`);
});

