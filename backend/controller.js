const WebSocket = require('ws');
const Order = require('./models.js');

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  console.log('WebSocket Client Connected');

  ws.on('close', () => {
    console.log('WebSocket Client Disconnected');
  });
});

exports.createOrder = async (req, res) => {
  const { tableNumber, orderItemsJson, totalBill } = req.body;
  const orderItems = JSON.parse(orderItemsJson);

  try {
    const newOrder = new Order({
      tableNumber,
      orderItems,
      totalBill,
    });

    await newOrder.save();

    // Broadcast the new order to all WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(newOrder));
      }
    });

    console.log('New Order Saved:', newOrder);
    res.status(201).json({ message: 'Order received successfully' });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ message: 'Error saving order' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

exports.deleteOrder = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    // Find and delete the order
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    // Broadcast the deleted order to all WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ action: 'delete', order: deletedOrder }));
      }
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order' });
  }
};


// Add this controller function in your backend controller
exports.clearAllOrders = async (req, res) => {
  try {
    // Delete all orders
    const deletedOrders = await Order.deleteMany();

    // Broadcast the cleared orders to all WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ action: 'clear', orders: deletedOrders }));
      }
    });

    res.json({ message: 'All orders cleared successfully' });
  } catch (error) {
    console.error('Error clearing orders:', error);
    res.status(500).json({ message: 'Error clearing orders' });
  }
};
