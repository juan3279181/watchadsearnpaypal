const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// PayPal client setup
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  if (process.env.PAYPAL_MODE === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
}

const client = new paypal.core.PayPalHttpClient(environment());

// Store user balances (in production, use a database)
const userBalances = {
  'user123': 10950
};

// Payout endpoint
app.post('/api/payout', async (req, res) => {
  try {
    const { email, amount, currency = 'INR', userId = 'user123' } = req.body;
    
    // Validate input
    if (!email || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and amount are required' 
      });
    }

    // Check user balance (in production, check database)
    const userBalance = userBalances[userId] || 0;
    const amountNumber = parseFloat(amount);
    
    if (userBalance < amountNumber * 1250) { // Convert INR to coins (₹20 = 25,000 coins)
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance' 
      });
    }

    // Create PayPal payout
    const request = new paypal.payouts.PayoutsPostRequest();
    request.requestBody({
      sender_batch_header: {
        sender_batch_id: `batch_${Date.now()}`,
        email_subject: "You have a payment from Notcoin",
        recipient_type: "EMAIL"
      },
      items: [{
        recipient_type: "EMAIL",
        amount: {
          value: amount.toString(),
          currency: currency
        },
        receiver: email,
        note: "Thank you for using Notcoin!",
        sender_item_id: `item_${Date.now()}`
      }]
    });

    console.log('Sending PayPal payout to:', email, 'Amount:', amount, currency);
    
    const response = await client.execute(request);
    
    // Deduct balance (in production, update database)
    userBalances[userId] -= amountNumber * 1250; // Convert INR to coins
    
    res.json({ 
      success: true, 
      payout_batch_id: response.result.batch_header.payout_batch_id,
      new_balance: userBalances[userId]
    });

  } catch (error) {
    console.error('PayPal Payout Error:', error);
    
    // Handle specific PayPal errors
    if (error.statusCode) {
      let errorMessage = 'PayPal payment failed';
      
      if (error.statusCode === 401) {
        errorMessage = 'PayPal authentication failed. Check your API credentials.';
      } else if (error.statusCode === 422) {
        errorMessage = 'Invalid recipient email or amount';
      }
      
      return res.status(400).json({ 
        success: false, 
        message: errorMessage,
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      details: error.message 
    });
  }
});

// Get user balance
app.get('/api/balance/:userId', (req, res) => {
  const userId = req.params.userId;
  const balance = userBalances[userId] || 0;
  res.json({ balance });
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Notcoin Backend is running!',
    status: 'OK' 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 PayPal Mode: ${process.env.PAYPAL_MODE}`);
});