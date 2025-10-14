#!/bin/bash
mkdir notcoin-backend
cd notcoin-backend
npm init -y
npm install express @paypal/checkout-server-sdk cors dotenv
npm install -D nodemon
echo "✅ Backend setup complete!"
echo "📝 Don't forget to:"
echo "   1. Add your PayPal Client Secret to .env file"
echo "   2. Run 'npm start' to start the server"