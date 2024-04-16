var express = require('express');
var router = express.Router();

// Import the controller functions
const { create, getAllPlants, getSelectedPlant, getSortedPlants, updatePlantIdentification } = require('../controllers/plantController');


/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const plants = await getAllPlants(); // Fetch all plants
    res.render('index', { title: 'Plant Sightings', correct_submission: 'true', plants }); // Render the 'plants.ejs' view with plants data
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/login', async function(req, res, next) {
  res.render('username')
})

// GET plant details page
router.get('/plant', function(req, res, next) {
  //let plant = plantController.getSelectedPlant
  let plant_id = req.query.id;
  let result = getSelectedPlant(plant_id);
  console.log(result[0])

  result.then(plant => {
    res.render('plant_details', { title: 'Plant Details', data: plant[0] });
  })
});

router.get('/add-plant', function(req, res, next) {
  res.render('form', { title: 'Plant Details', correct_submission: 'true' });
});

router.post('/add-plant', async function(req, res, next) {
  await create({
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
    photo: req.body.base64Image,
    // Handling for file upload will be required here for `photo`
    user: req.body.user_nickname
  });

  res.redirect('/');
});

router.get('/update-plant', function(req, res, next) {
  res.render('update_plant');
});

router.post('/update-plant', function(req, res, next) {
  let plant_name = req.body.plant_name;
  console.log("Plant name - ", plant_name);

  let plant_status = req.body.plant_status;
  console.log("Plant status -", plant_status)

  // do something with the new values - update the DB record
});


module.exports = router;
