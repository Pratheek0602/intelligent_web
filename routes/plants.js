var express = require('express');
var router = express.Router();

/**
 * GET route to render the plant details page.
 */
router.get('/plant', function(req, res, next) {
  res.render('plant_details', {title: 'Plant Details'});
});

module.exports = router;