import mongoose from 'mongoose';
import * as process from 'process';
import { fetch_sa_assets } from './tasks';

let database: mongoose.Connection;
let is_connected = false;

export function is_db_connected(): boolean {
  return is_connected;
}
export const connectDB = () => {
  if (process.env.MONGOURL) {
    // add your own uri below
    const uri = process.env.MONGOURL;
    if (database) {
      return;
    }
    mongoose.set('strictQuery', true);
    mongoose.connect(uri);

    database = mongoose.connection;
    database.once('open', async () => {
      console.log('Connected to database...');
      is_connected = true;
    });
    database.on('error', () => {
      console.log('Error connecting to database');
      is_connected = false;
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
