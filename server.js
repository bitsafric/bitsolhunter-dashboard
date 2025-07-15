require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ Health check route
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'BitSolHunter backend is alive' });
});

// ✅ Payment verification route
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

    // ✅ Check for SOL payment (native transfer)
    const solPayment = transactions.some(tx =>
      tx.nativeTransfers && tx.nativeTransfers.some(transfer =>
        transfer.toUserAccount === wallet && parseFloat(transfer.amount) 
>= 2039280 // Example threshold in lamports (~$30 SOL)
      )
    );

    // ✅ Check for USDT payment (token transfer)
// Example threshold for 30 USDT (since USDT has 6 decimals)
const usdtPayment = transactions.some(tx =>
  tx.tokenTransfers && tx.tokenTransfers.some(transfer =>
    transfer.userAccount === wallet &&
    transfer.mint === "Es9vMFrzrXyKbnntR1PdhHb9jdqkV6ttcKxZjYzR8jga" &&
    parseFloat(transfer.rawTokenAmount.tokenAmount) >= 30 * 10 ** 6
  )
);

    if (solPayment || usdtPayment) {
      return res.status(200).json({ verified: true });
    } else {
return res.status(403).json({ 
  verified: false, 
  message: 'No valid transactions found' 
});
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`BitSolHunter backend is running on port ${port}`);
});

