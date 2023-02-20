import mongoose, { Schema } from 'mongoose';

const parseErrorSchema = new Schema({
  signature: { type: String, unique: true },
  timestamp: Number,
});

export const ParseError = mongoose.model(
  'ParseError',
  parseErrorSchema,
  'ParseError'
);
