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
  {
    date: new Date(),
    location: "Backyard",
    description: "Small shrub with vibrant flowers.",
    size: { height: 3, spread: 4 },
    characteristics: {
      flowers: "Red and yellow",
      leaves: "Small and green",
      fruits: "Berries",
      seeds: "Tiny, black",
      sun: "Partial shade"
    },
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
      flowers: "Rarely flowers",
      leaves: "Variegated, green and white",
      fruits: "None",
      seeds: "Not applicable",
      sun: "Indirect light"
    },
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
      flowers: "None",
      leaves: "Deep green, feathery",
      fruits: "None",
      seeds: "Spores on undersides of fronds",
      sun: "Shade"
    },
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
