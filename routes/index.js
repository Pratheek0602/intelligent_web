var express = require('express');
var router = express.Router();

// Import the controller functions
const {create, getAllPlants, getSelectedPlant, getSortedPlants, updatePlantIdentification } = require('../controllers/plantController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Plant Sightings', correct_submission: 'true' });
});

// GET plant details page
router.get('/plant', function(req, res, next) {
  //let plant = plantController.getSelectedPlant
  let plant_id = req.query.id;
  let result = getSelectedPlant(plant_id);

  result.then(plant => {
    let data = JSON.parse(plant);
    console.log(data.length);
    res.render('plant_details', { title: 'Plant Details', data: data });
  })
});

router.get('/add-plant', function(req, res, next) {
  res.render('form', { title: 'Plant Details', correct_submission: 'true' });
});

router.post('/add-plant', function(req, res, next) {
  let location = req.body.location;
  console.log("Location - ", location);

  if (location === 'Test') {
    res.redirect('/');
  } else {
    res.render('index', { title: 'Express', correct_submission: 'false' });
  }
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
