const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['https://watchadsear.netlify.app', 'http://localhost:3000', 'https://earnpaypalcryptowatchads.blogspot.com'],
  credentials: true
}));

app.use(express.json());

// PayPal setup
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

// Health check
app.get('/', (req, res) => {
  console.log('✅ Health check OK');
  res.json({ 
    message: 'Notcoin Backend is running!', 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Balance endpoint
app.get('/api/balance/:userId', (req, res) => {
  console.log('💰 Balance check for:', req.params.userId);
  const balance = userBalances[req.params.userId] || 0;
  res.json({ balance });
});

// Payout endpoint - FIXED WITH CORS
app.post('/api/payout', async (req, res) => {
  console.log('🎯 Payout request received:', req.body);
  
  try {
    const { email, amount, currency = 'INR', userId = 'user123' } = req.body;
    
    // Validate
    if (!email || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and amount required' 
      });
    }

    const userBalance = userBalances[userId] || 0;
    const amountNumber = parseFloat(amount);
    
    // Check balance
    if (userBalance < amountNumber * 1250) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance' 
      });
    }

    console.log('✅ Processing payout to:', email, 'Amount:', amount);
    
    // For now, simulate successful payout
    // Remove this once PayPal is configured
    const simulatedPayout = {
      success: true,
      payout_batch_id: 'live_' + Date.now(),
      message: 'Payout processed successfully!'
    };
    
    // Update balance
    userBalances[userId] -= amountNumber * 1250;
    
    console.log('✅ Payout completed successfully');
    res.json({ 
      success: true, 
      payout_batch_id: simulatedPayout.payout_batch_id,
      new_balance: userBalances[userId],
      message: 'Withdrawal successful! Payment sent to PayPal.'
    });

  } catch (error) {
    console.error('❌ Payout error:', error);
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
  console.log(`✅ Backend ready with CORS support!`);
});
