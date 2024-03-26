const plantModel = require('../models/plants');

exports.create = function(userData) {
  let plant = new plantModel({
    date: userData.date,
    location: userData.location,
    description: userData.description,
    size: {
      height: userData.height,
      spread: userData.spread,
    },
    characteristics: {
      flowers: userData.flowers,
      leaves: userData.leaves,
      fruits: userData.fruits,
      seeds: userData.seeds,
      sun: userData.sun,
    },
    identification: {
      name: userData.name,
      status: userData.status,
    },
    photo: userData.photo, // TODO: Will need function to convert image file to base64 string
    user: userData.username,
  });

  return plant.save().then(plant => {
    console.log(plant);

    return JSON.stringify(plant);
  }).catch(err => {
    console.log(err);

    return null;
  });
};

