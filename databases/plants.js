const mongoose = require('mongoose');

const mongoDB = 'mongodb://localhost:27017/users'; // MongoDB connection URL
let connection;
mongoose.Promise = global.Promise;

/**
 * Connect to MongoDB database.
 * @returns {Promise} - Promise resolving to the connection object.
 */
mongoose.connect(mongoDB).then(result => {
  connection = result.connection;
  console.log("MongoDB's connection successful");
}).catch(err => {
  console.log("MongoDB's connection failed", err);
});

