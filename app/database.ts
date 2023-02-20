import mongoose from 'mongoose';
import * as process from 'process';

let database: mongoose.Connection;
export const connectDB = () => {
  if (process.env.MONGOURL) {
    // add your own uri below
    const uri = process.env.MONGOURL;
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
  } else {
    console.log('Please set the ENV:(MONGOURL)');
  }
};
export const disconnectDB = () => {
  if (!database) {
    return;
  }
  mongoose.disconnect();
};
