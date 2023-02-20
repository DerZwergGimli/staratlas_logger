import mongoose, { Schema } from 'mongoose';

const exchangeSchema = new Schema({
  signature: { type: String, unique: true },
  timestamp: Number,
  assetMint: String,
  currencyMint: String,
  orderTaker: String,
  orderInitializer: String,
  size: Number,
  price: Number,
  cost: Number,
});

export const Exchange = mongoose.model('Exchange', exchangeSchema, 'Exchange');
