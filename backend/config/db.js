const mongoose = require('mongoose');

async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {});
    console.log('Database connected successfully');
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1); 
  }
}

module.exports = connectDB;