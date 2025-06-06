const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Define a schema for chatbot responses
const ChatbotSchema = new mongoose.Schema({
  question: String,
  answer: String,
});

const ChatbotResponse = mongoose.model("ChatbotResponse", ChatbotSchema);

// Connect to MongoDB and add sample data
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Add sample data to the database
    const sampleData = [
      { question: "hello", answer: "Hi there!" },
      { question: "how are you", answer: "I'm good, thank you!" },
      { question: "what is your name", answer: "I am a chatbot." },
      { question: "what services do you offer", "answer": "We offer printing services including business cards, brochures, banners, flyers, posters, and more." },
  { question: "do you provide custom designs", "answer": "Yes! We offer custom design services to match your needs." },
  { question: "what file formats do you accept", "answer": "We accept PDF, PNG, JPG, and AI formats for printing." },
  { question: "how long does printing take", "answer": "Standard printing takes 3-5 business days. Express printing is also available." },
  { question: "can I track my order", "answer": "Yes, you will receive a tracking link once your order is shipped." },
  { question: "do you offer bulk discounts", "answer": "Yes, we offer discounts for bulk printing orders. Contact us for details!" },
  { question: "what is the minimum order quantity", "answer": "The minimum order quantity depends on the product. For example, business cards start at 100 pieces." },
  { question: "do you offer delivery services", "answer": "Yes, we provide delivery across multiple locations. Shipping costs vary based on your location." },
  { question: "how can I place an order", "answer": "You can place an order online through our website or visit our store." },
  { question: "do you offer sample prints", "answer": "Yes, sample prints are available upon request for an additional charge." },
  { question: "what payment methods do you accept", "answer": "We accept credit/debit cards, PayPal, and bank transfers." },
  { question: "can I cancel or modify my order", "answer": "You can modify or cancel your order within 24 hours of placing it." },
  { question: "do you print on eco-friendly paper", "answer": "Yes, we offer eco-friendly paper options for printing." },
  { question: "what is your return policy", "answer": "We accept returns only for damaged or incorrect prints. Contact our support team for assistance." },
  { question: "do you provide logo design services", "answer": "Yes, we have professional designers who can create custom logos for your business." }
  
    ];

    ChatbotResponse.insertMany(sampleData)
      .then(() => console.log("Sample data added"))
      .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));

// API endpoint to get chatbot response
app.post("/chatbot", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await ChatbotResponse.findOne({ question: message.toLowerCase() });

    if (response) {
      res.json({ reply: response.answer });
    } else {
      res.json({ reply: "That's an interesting question! Can you please rephrase or tell me a bit more so I can help you better?" });

    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:${PORT}");
});