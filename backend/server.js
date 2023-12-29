const express = require('express');
const cors = require('cors');
const connectDB = require('./connectdb.js').connectDB;
const app = express();
const port = process.env.port || 5000;

const { createOrder, getOrders, deleteOrder, clearAllOrders } = require('./controller.js');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

const DATABASE_URL = process.env.url;

connectDB(DATABASE_URL);

// Routes
app.post('/api/orders', createOrder);
app.get('/api/orders', getOrders);
app.delete('/api/orders/:orderId', deleteOrder);
app.delete('/api/orders', clearAllOrders);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
