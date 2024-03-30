var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Plant Sightings', correct_submission: 'true' });
});

// GET plant details page
router.get('/plant', function(req, res, next) {
  res.render('plant_details', { title: 'Plant Details' });
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


module.exports = router;
