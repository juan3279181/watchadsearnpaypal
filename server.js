const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple PayPal setup for testing
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  console.log('PayPal Client ID:', clientId ? 'SET' : 'MISSING');
  console.log('PayPal Client Secret:', clientSecret ? 'SET' : 'MISSING');
  
  if (process.env.PAYPAL_MODE === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
}

const client = new paypal.core.PayPalHttpClient(environment());

// Store user balances
const userBalances = {
  'user123': 10950
};

// Simple health check
app.get('/', (req, res) => {
  console.log('Health check received');
  res.json({ 
    message: 'Notcoin Backend is running!', 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Balance endpoint
app.get('/api/balance/:userId', (req, res) => {
  const userId = req.params.userId;
  const balance = userBalances[userId] || 0;
  console.log('Balance request for:', userId, 'Balance:', balance);
  res.json({ balance });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ 
    message: 'Test successful!',
    backend: 'working',
    paypal: 'configured'
  });
});

// Payout endpoint - SIMPLIFIED FOR TESTING
app.post('/api/payout', async (req, res) => {
  console.log('Payout request received:', req.body);
  
  try {
    const { email, amount, currency = 'INR', userId = 'user123' } = req.body;
    
    // Validate input
    if (!email || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and amount are required' 
      });
    }

    // Check user balance
    const userBalance = userBalances[userId] || 0;
    const amountNumber = parseFloat(amount);
    
    if (userBalance < amountNumber * 1250) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance' 
      });
    }

    console.log('Attempting PayPal payout to:', email, 'Amount:', amount, currency);
    
    // SIMULATE PAYPAL PAYOUT FOR TESTING
    // Remove this simulation once PayPal works
    console.log('SIMULATION: PayPal payout would be sent here');
    
    // For now, just simulate success
    const simulatedPayout = {
      success: true,
      payout_batch_id: 'simulated_batch_' + Date.now(),
      message: 'Payout simulated - add real PayPal credentials'
    };
    
    // Update balance
    userBalances[userId] -= amountNumber * 1250;
    
    console.log('Payout simulated successfully');
    res.json({ 
      success: true, 
      payout_batch_id: simulatedPayout.payout_batch_id,
      new_balance: userBalances[userId],
      message: 'Payout simulated - working on real PayPal integration'
    });

  } catch (error) {
    console.error('Payout Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 PayPal Mode: ${process.env.PAYPAL_MODE || 'sandbox'}`);
  console.log(`✅ Backend ready at: http://localhost:${PORT}`);
});
