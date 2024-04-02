const mongoose = require('mongoose');
const Plant = require('../models/plants'); // Adjust path as necessary
const db = 'mongodb://localhost:27017/com3504_21';

// node ./scripts/seedPlants.js

const plantsData = [
  {
    date: new Date(),
    location: "Garden",
    description: "Tall tree with lots of green leaves.",
    size: { height: 20, spread: 5 },
    characteristics: {
      flowers: false,
      leaves: true,
      fruits: false,
      thorns: false,
      seeds: true,
    },
    sunExposure: "Full Sun",
    identification: {
      name: "Oak Tree",
      status: "Completed"
    },
    photo: "base64String", // Placeholder, replace with actual base64 string
    user: "JohnDoe",
  },
  {
    date: new Date(),
    location: "Backyard",
    description: "Small shrub with vibrant flowers.",
    size: { height: 3, spread: 4 },
    characteristics: {
      flowers: true,
      leaves: true,
      fruits: true,
      thorns: false,
      seeds: true,
    },
    sunExposure: "Full Sun",
    identification: {
      name: "Flowering Quince",
      status: "In Progress"
    },
    photo: "base64String", // Placeholder, replace with actual base64 string
    user: "AliceB",
  },
  {
    date: new Date(),
    location: "Window sill",
    description: "Potted plant with trailing vines.",
    size: { height: 1, spread: 2 },
    characteristics: {
      flowers: true,
      leaves: true,
      fruits: false,
      thorns: false,
      seeds: false,
    },
    sunExposure: "Full Sun",
    identification: {
      name: "Spider Plant",
      status: "Completed"
    },
    photo: "base64String", // Placeholder, replace with actual base64 string
    user: "CharlieGreen",
  },
  {
    date: new Date(),
    location: "Conservatory",
    description: "Large fern with lush fronds.",
    size: { height: 5, spread: 5 },
    characteristics: {
      flowers: false,
      leaves: true,
      fruits: false,
      thorns: false,
      seeds: true,
    },
    sunExposure: "Partial Sun",
    identification: {
      name: "Boston Fern",
      status: "Completed"
    },
    photo: "base64String", // Placeholder, replace with actual base64 string
    user: "DannyF",
  }
];

// Add more plant data later


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
