const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL;
  if (!uri) throw new Error('MongoDB connection string is missing. Add MONGODB_URI to backend/.env.');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected (${mongoose.connection.name})`);
};
