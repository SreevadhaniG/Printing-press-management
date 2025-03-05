const express = require('express');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();

app.use(express.json());

async function startServer() {
  try {
    const db = await connectDB();
    console.log('Database connection established');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();