var express = require('express');
var router = express.Router();

const Plant = require('../models/plants'); 

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const plants = await Plant.find(); // Fetch all plants
    res.render('index', { title: 'Plant Sightings', correct_submission: 'true', plants }); // Render the 'plants.ejs' view with plants data
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// GET plant details page
router.get('/plant', function(req, res, next) {
  res.render('plant_details', { title: 'Plant Details' });
});

router.get('/add-plant', function(req, res, next) {
  res.render('form', { title: 'Plant Details', correct_submission: 'true' });
});

// router.post('/add-plant', function(req, res, next) {
//   let location = req.body.location;
//   console.log("Location - ", location);

//   if (location === 'Test') {
//     res.redirect('/');
//   } else {
//     res.render('index', { title: 'Express', correct_submission: 'false' });
//   }
// });

router.post('/add-plant', async function(req, res, next) {
  try {
    // Constructing the plant object from request body
    let newPlant = new Plant({
      date: req.body.date_time_seen,
      location: req.body.location,
      description: req.body.description,
      size: {
        height: req.body.plant_height,
        spread: req.body.plant_spread
      },
      characteristics: {
        flowers: req.body.flowers === "Flowers",
        leaves: req.body.leaves === "Leaves",
        fruits: req.body.fruits === "Fruits",
        thorns: req.body.thorns === "Thorns",
        seeds: req.body.seeds === "Seeds",
      },
      identification: {
        name: req.body.identification_name,
        status: "lol"//req.body.identification_name,
      },
      sunExposure: req.body.sun_exposure,
      // flowersColour: req.body.flowers_colour,
      photo: "lol",
      // Handling for file upload will be required here for `photo`
      user: req.body.user_nickname
    });

    // Save the new plant to the database
    await newPlant.save();
    res.redirect('/'); // Redirect to the home page or to a success page
  } 
  catch (error) {
    console.error("Failed to save the plant:", error);
    // Respond with an error page or message
    // res.render('index', { title: 'Express', correct_submission: 'false', errorMessage: 'Failed to add the plant.' });
  }
});

module.exports = router;
