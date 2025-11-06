const mongoose = require('mongoose');

const db_uri = 'mongodb://127.0.0.1:27017/test';

async function dbConnect() {
  mongoose.connection.on('connected', () => console.log(`[MONGODB-CONNECT] >>> Database connected`));
  mongoose.connection.on('open', () => console.log(`[MONGODB-CONNECT] >>> Database opened!`));
  await mongoose.connect(db_uri, {
    dbName: 'kcs'
  });
}

module.exports = dbConnect;