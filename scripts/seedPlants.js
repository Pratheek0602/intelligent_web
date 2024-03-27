const mongoose = require('mongoose');
const Plant = require('../models/plant'); // Adjust path as necessary
const db = 'mongodb://locahost:27017//users';

const plantsData = [
  {
    date: new Date(),
    location: "Garden",
    description: "Tall tree with lots of green leaves.",
    size: { height: 20, spread: 5 },
    characteristics: {
      flowers: "None",
      leaves: "Green and large",
      fruits: "None",
      seeds: "Small, brown",
      sun: "Full sun"
    },
    identification: {
      name: "Oak Tree",
      status: "Completed"
    },
    photo: "base64String", // Placeholder, replace with actual base64 string
    user: "JohnDoe",
  },

  // Add more plant later
];

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected…");
    return Plant.deleteMany({}); // clears out existing data
  })
  .then(() => {
    return Plant.insertMany(plantsData);
  })
  .then((res) => {
    console.log("Seed data inserted", res);
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("An error occurred:", err);
    mongoose.connection.close();
  });
