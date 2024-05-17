const plantModel = require('../models/plants');

/**
 * Create a new plant sighting record in the database.
 * @param {Object} userData - User input data for the new plant sighting.
 * @param {string} filePath - File path to the photo of the plant.
 * @returns {Promise<string|null>} - Promise resolving to JSON string of the created plant record or null if failed.
 */
exports.create = function(userData, filePath) {
  // Create a new plant object using the provided user data
  let plant = new plantModel({
    date: userData.date,
    description: userData.description,
    longitude: userData.longitude,
    latitude: userData.latitude,
    size: {
      height: userData.size.height,
      spread: userData.size.spread,
    },
    characteristics: {
      flowers: userData.characteristics.flowers,
      leaves: userData.characteristics.leaves,
      fruits: userData.characteristics.fruits,
      seeds: userData.characteristics.seeds,
      thorns: userData.characteristics.thorns,
    },
    identification: {
      name: userData.identification.name,
      status: userData.identification.status,
    },
    sunExposure: userData.sunExposure,
    photo: filePath,
    user: userData.user,
  });

  // Save the new plant record to the database
  return plant.save().then(plant => {
    console.log(plant);

    return JSON.stringify(plant);
  }).catch(err => {
    console.log(err);

    return null;
  });
};


/**
 * Retrieve all plant records from the database.
 * @returns {Promise<Array>} - Promise resolving to an array of plant records.
 */
exports.getAllPlants = function() {
  // Execute query to find all plant records without any sorting or filtering
  return plantModel.find({}).then(plants => {
    return plants;
  }).catch(err => {
    console.error(err);
    return [];
  });
};

/**
 * Retrieve a specific plant record from the database based on its ID.
 * @param {string} plantID - ID of the plant record to retrieve.
 * @returns {Promise<Array>} - Promise resolving to an array containing the requested plant record.
 */
exports.getSelectedPlant = function(plantID) {
  // Execute query to find the plant record matching the plantID
  return plantModel.find({ _id: plantID }).then(plant => {
    return plant;
  }).catch(err => {
    console.error(err);
    return [];
  });
};


/**
 * Retrieve and sort plant records from the database based on sorting preferences.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {void}
 */
async function getSortedPlants(req, res) {
  try {
    // Read sorting preferences from query parameters
    const sortByDate = req.query.sortByDate; // 'asc' for ascending, 'desc' for descending
    const identificationStatus = req.query.identificationStatus; // 'completed' or 'in progress'

    // Build the query object for identification status
    let query = {};
    if (identificationStatus) {
      query['identification.status'] = identificationStatus;
    }

    // Build the sorting criteria
    let sort = {};
    if (sortByDate) {
      sort.date = sortByDate === 'asc' ? 1 : -1;
    }

    // Fetch the sorted records from the database
    const plants = await plantModel.find(query).sort(sort);

    // Respond with the sorted records
    res.status(200).json(plants);
  } catch (error) {
    // Handle possible errors
    res.status(500).json({ message: error.message });
  }
}

/**
 * Update an existing plant record in the database with new information.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {string} filePath - File path to the updated photo of the plant.
 * @returns {void}
 */
exports.updatePlantIdentification = async (req, res, filePath) => {
  try {
    const plantId = req.body.plant_id;
    const plant_status = req.body.plant_status;
    const plant = await plantModel.find({ _id: plantId });

    console.log("herererer", filePath)

    if (!plant) {
      return res.status(404).json({ message: "Plant record not found." });
    }
    if (req.body.plant_name) {
      plant[0].identification.name = req.body.plant_name;
    }
    if (req.body.date_time_seen) {
      plant[0].date = req.body.date_time_seen;
    }
    if (req.body.description) {
      plant[0].description = req.body.description;
    }
    if (req.body.latitude) {
      plant[0].latitude= req.body.latitude
    }
    if (req.body.longitude) {
      plant[0].longitude= req.body.longitude
    }
    if (req.body.plant_height) {
      plant[0].size.height = req.body.plant_height
    }
    if (req.body.plant_spread) {
      plant[0].size.spread = req.body.plant_spread
      
    }
    if (req.body.flowers) { 
      plant[0].characteristics.flowers = true;
    }
    else {
      plant[0].characteristics.flowers = false;
    }
    if (req.body.leaves) {
      plant[0].characteristics.leaves = true;
    }
    else {
      plant[0].characteristics.leaves = false;
    }
    if (req.body.fruits) {
      plant[0].characteristics.fruits = true;
    }
    else {
      plant[0].characteristics.fruits = false;
    }
    if (req.body.thorns) {
      plant[0].characteristics.thorns = true;
    }
    else {
      plant[0].characteristics.thorns = false;
    }
    if (req.body.seeds) {
      plant[0].characteristics.seeds = true;
    }
    else {
      plant[0].characteristics.seeds = false;
    }
    if (req.body.sun_exposure) {
      plant[0].sunExposure = req.body.sun_exposure;
    }
    if (filePath) {
      plant[0].photo = filePath;
    }
    plant[0].identification.status = plant_status;

    await plant[0].save();

  } catch (error) {
    console.log(error)
  }
}


