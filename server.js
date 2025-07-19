require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 🔐 In-memory mock user database
const users = {};
let botRunning = false;

// ✅ JWT Middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ✅ Health Check
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'BitSolHunter backend is alive' });
});

// ✅ Registration with referral support
app.post('/api/register', async (req, res) => {
  const { username, password, referrerId } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' 
});

  if (users[username]) return res.status(400).json({ error: 'User already exists' });

  let referrer = null;
  if (referrerId) {
    referrer = users[referrerId];
    if (!referrer) return res.status(400).json({ error: 'Invalid referrer ID' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    username,
    password: hashedPassword,
    referrerId: referrerId || null,
    referredUsers: [],
    referralEarnings: []
  };

  users[username] = newUser;
  if (referrer) {
    referrer.referredUsers.push(username);
    referrer.referralEarnings.push({
      from: username,
      level: 1,
      amount: 5
    });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '2h' });
  return res.status(201).json({ message: 'User registered', token });
});

// ✅ Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '2h' });
  return res.json({ message: 'Login successful', token });
});

// ✅ Payment Verification (Helius)
app.post('/verify-payment', async (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: 'Wallet required' });

  try {
    const url = 
`https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${process.env.HELIUS_API_KEY}`;
    const response = await axios.get(url);
    const transactions = response.data;

    const solPayment = transactions.some(tx =>
      tx.nativeTransfers?.some(transfer =>
        transfer.toUserAccount === wallet &&
        transfer.mint === "So11111111111111111111111111111111111111112" &&
        parseFloat(transfer.amount || 0) >= 30
      )
    );

    const usdtPayment = transactions.some(tx =>
      tx.tokenTransfers?.some(transfer =>
        transfer.toUserAccount === wallet &&
        transfer.mint === "Es9vMFrzrXyKbnntR1PdhHb9jdqkV6ttcKxZjYzR8jga" &&
        parseFloat(transfer.tokenAmount?.uiAmount || 0) >= 30
      )
    );

    if (solPayment || usdtPayment) {
      return res.status(200).json({ verified: true });
    } else {
      return res.status(403).json({ verified: false, message: 'No valid transactions found' });
    }
  } catch (err) {
    console.error('Helius error:', err.message);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// ✅ Referral Dashboard
app.get('/referral-dashboard/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  const user = users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    referralCode: user.username,
    referredUsersCount: user.referredUsers.length,
    referredUsers: user.referredUsers
  });
});

// ✅ Referral Earnings API
app.get('/api/referral-earnings/:username', authenticateToken, (req, res) => {
  const { username } = req.params;
  const user = users[username];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const breakdown = user.referralEarnings || [];
  const totalEarnings = breakdown.reduce((sum, entry) => sum + entry.amount, 0);

  res.json({
    totalEarnings,
    breakdown
  });
});

// ✅ Bot Control
app.post('/api/bot/start', authenticateToken, (req, res) => {
  exec('python3 bot/main.py', (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: 'Failed to start bot' });
    }
    botRunning = true;
    res.json({ status: 'started', message: '✅ Bot started' });
  });
});

app.post('/api/bot/stop', authenticateToken, (req, res) => {
  exec('pkill -f bot/main.py', (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: 'Failed to stop bot' });
    }
    botRunning = false;
    res.json({ status: 'stopped', message: '🛑 Bot stopped' });
  });
});

app.get('/api/bot/status', authenticateToken, (req, res) => {
  res.json({ running: botRunning });
});

// ✅ Static Views
app.get('/dashboard', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});
app.get('/admin', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
});
app.get('/referral', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'referral-dashboard.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ BitSolHunter backend is running on port ${port}`);
});

