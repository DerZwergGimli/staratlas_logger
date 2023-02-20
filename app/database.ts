import mongoose from 'mongoose';

let database: mongoose.Connection;
export const connectDB = () => {
  // add your own uri below
  const uri =
    'mongodb+srv://writer:wr7Dtq13MafK4LTe@cluster0.2hmgfgu.mongodb.net/?retryWrites=true&w=majority';
  if (database) {
    return;
  }
  mongoose.connect(uri);
  database = mongoose.connection;
  database.once('open', async () => {
    console.log('Connected to database');
  });
  database.on('error', () => {
    console.log('Error connecting to database');
  });
};
export const disconnectDB = () => {
  if (!database) {
    return;
  }
  mongoose.disconnect();
};
