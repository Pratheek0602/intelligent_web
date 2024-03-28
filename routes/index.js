var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Plant Sightings' });
});

// GET plant details page
router.get('/plant', function(req, res, next) {
  res.render('plant_details', {title: 'Plant Details'});
});



module.exports = router;
