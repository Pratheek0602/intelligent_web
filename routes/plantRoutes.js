var express = require('express');
var router = express.Router();

// Import the controller functions
const {create, getAllPlants, getSortedPlants, updatePlantIdentification } = require('../controllers/plantController');

/**
 * GET route to retrieve all plants.
 */
router.get('/', getAllPlants);

/**
 * POST route to create a new plant.
 */
router.post('/', create);

/**
 * PATCH route to update the identification section of a plant record.
 * @param {string} id - The ID of the plant to update.
 */
router.patch('/:id/updateIdentification', updatePlantIdentification);

// Export the router so it can be mounted in the main application file
module.exports = router;
