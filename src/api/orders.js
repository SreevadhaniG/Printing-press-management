import express from 'express';
import Order from '../models/Order';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/orders', protect, async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;