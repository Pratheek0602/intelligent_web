var express = require('express');
var router = express.Router();

// Import the controller functions
const {create, getAllPlants, getSortedPlants, updatePlantIdentification } = require('../controllers/plantController');

// Route for getting all plants (just an example)
router.get('/', getAllPlants);

// Route for creating a new plant
router.post('/', create);

// Route for updating the identification section of a plant record
router.patch('/:id/updateIdentification', updatePlantIdentification);

// Export the router so it can be mounted in the main application file
module.exports = router;
