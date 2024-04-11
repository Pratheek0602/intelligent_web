const mongoose = require('mongoose');

const mongoDB = 'mongodb://localhost:27017/users';

let connection;

mongoose.Promise = global.Promise;

mongoose.connect(mongoDB).then(result => {
  connection = result.connection;
  console.log("Connection successful");
}).catch(err => {
  console.log("Connection failed", err);
});

