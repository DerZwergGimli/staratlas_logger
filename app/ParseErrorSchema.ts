import mongoose, { Schema } from 'mongoose';

const parseErrorSchema = new Schema({
  timestamp: Number,
  signature: String,
});

export const ParseError = mongoose.model(
  'ParseError',
  parseErrorSchema,
  'ParseError'
);
