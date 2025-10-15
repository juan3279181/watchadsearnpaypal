const express = require('express');
const cors = require('cors');
const paypal = require('@paypal/checkout-server-sdk');

const app = express();
const PORT = process.env.PORT || 10000;

// CORS Configuration
app.use(cors({
  origin: [
    'https://watchadsear.netlify.app',
    'http://localhost:3000',
    'http://localhost:8080'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check received');
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Payout endpoint
app.post('/api/payout', async (req, res) => {
  try {
    console.log('🎯 Payout request received:', req.body);
    
    const { email, amount, currency, userId } = req.body;

    // Input validation
    if (!email || !amount || !currency || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, amount, currency, userId'
      });
    }

    // Add your PayPal payout logic here
    // For now, returning a mock response
    console.log(`Processing payout: ${amount} ${currency} to ${email} for user ${userId}`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful response
    res.json({
      success: true,
      message: 'Payout processed successfully',
      transactionId: 'TXN_' + Date.now(),
      amount: amount,
      currency: currency,
      email: email
    });

  } catch (error) {
    console.error('Payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Handle preflight requests
app.options('*', cors());

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 PayPal Mode: sandbox`);
  console.log(`✅ Backend ready with CORS support!`);
  console.log(`✅ Health check OK`);
});

module.exports = app;
