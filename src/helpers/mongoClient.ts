import mongoose from 'mongoose';

const connectMongo = async () => {
  if (!process.env.MONGO_URI || !process.env.dbName) {
    throw new Error('MONGO_URI and dbName must be set in environment variables');
  }
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.dbName,
  });
};

export default connectMongo;
