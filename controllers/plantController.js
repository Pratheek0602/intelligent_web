const plantModel = require('../models/plants');

//CREATE PLANT SIGHTING
exports.create = function(userData) {
  let plant = new plantModel({
    date: userData.date,
    location: userData.location,
    description: userData.description,
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
    photo: userData.photo, // TODO: Will need function to convert image file to base64 string
    user: userData.user,
  });

  return plant.save().then(plant => {
    console.log(plant);

    return JSON.stringify(plant);
  }).catch(err => {
    console.log(err);

    return null;
  });
};


// READ DATA
exports.getAllPlants = function() {
  // Execute query to find all plant records without any sorting or filtering
  return plantModel.find({}).then(plants => {
    return plants;
  }).catch(err => {
    console.error(err);
    return [];
  });
};


exports.getSelectedPlant = function(plantID) {
  // Execute query to find the plant record matching the plantID
  return plantModel.find({ _id: plantID }).then(plant => {
    console.log(plant);

    //return plant;
    return plant;
  }).catch(err => {
    console.error(err);
    return [];
  });
};


// READ AND SORT BY DATA
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

// UPDATE DATA
// change to a normal function with args:(plant_name, plant_status, plant_id)
// async function necessary?
exports.updatePlantIdentification = async (req, res) => {
  try {
    // Extract the plant ID from the route parameter
    const plantId = req.params.id;

    // Assuming the user's nickname is stored in req.user.nickname
    const userNickname = req.user.nickname;
    // verify plant.user in advance so that the update button is only displayed
    // if the user has permission to update the plant details

    // Extract the identification updates from the request body
    const { name, status } = req.body;

    // First, find the plant record to ensure it exists and to check the user's permission
    const plant = await plantModel.find({ _id: plantId });

    if (!plant) {
      return res.status(404).json({ message: "Plant record not found." });
    }

    // Check if the user's nickname matches the plant record's nickname
    if (plant.user !== userNickname) {
      return res.status(403).json({ message: "You do not have permission to update this record." });
    }

    // Update the identification section of the plant record
    plant.identification.name = name || plant.identification.name;
    plant.identification.status = status || plant.identification.status;

    await plant.save();

    // Respond with the updated record
    res.status(200).json(plant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


