const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  tableNumber: Number,
  orderItems: [{ id: Number, name: String, price: Number, quantity: Number }],
  totalBill: Number,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;