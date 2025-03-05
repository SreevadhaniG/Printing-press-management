import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
  logo: { type: String, required: true },
  sampleDesign: String,
  description: String,
  email: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  gstAmount: { type: Number, required: true },
  finalAmount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  orderStatus: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'completed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);