const plantModel = require('../models/plants');

//CREATE PLANT SIGHTING
exports.create = function(userData) {
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
// exports.updatePlantIdentification = async (req, res) => {
//   try {
//     // Extract the plant ID from the route parameter
//     const plantId = req.body.plant_id;
//     console.log(plantId)

//     const plant_name = req.body.plant_name;
//     const plant_status = req.body.plant_status;

//     // First, find the plant record to ensure it exists and to check the user's permission
//     const plant = await plantModel.find({ _id: plantId });
//     console.log(plant)

//     if (!plant) {
//       return res.status(404).json({ message: "Plant record not found." });
//     }

//     // Update the identification section of the plant record
//     plant[0].identification.name = plant_name;
//     // console.log("hi");
//     // console.log(plant.identification);
//     plant[0].identification.status = plant_status;

//     await plant[0].save();

//   } catch (error) {
//     //res.status(500).json({ message: error.message });
//     console.log(error)
//   }
// }

// UPDATE DATA
// exports.updatePlantIdentification = async (req, res) => {
//   try {
//     // Extract the plant ID from the request body
//     const plantId = req.body.plant_id;

//     // Find the existing plant record
//     const plant = await plantModel.findById(plantId);
//     if (!plant) {
//       return res.status(404).json({ message: "Plant record not found." });
//     }

//     // Update fields from the form
//     plant.identification.name = req.body.plant_name || plant.identification.name;
//     plant.identification.status = req.body.plant_status || plant.identification.status;
//     plant.date = req.body.date_time_seen || plant.date;
//     plant.description = req.body.description || plant.description;
//     plant.location = { 
//       latitude: req.body.latitude || plant.location.latitude,
//       longitude: req.body.longitude || plant.location.longitude
//     };
//     plant.size = {
//       height: req.body.plant_height || plant.size.height,
//       spread: req.body.plant_spread || plant.size.spread
//     };
//     plant.characteristics = {
//       flowers: req.body.flowers || plant.characteristics.flowers,
//       leaves: req.body.leaves || plant.characteristics.leaves,
//       fruits: req.body.fruits || plant.characteristics.fruits,
//       thorns: req.body.thorns || plant.characteristics.thorns,
//       seeds: req.body.seeds || plant.characteristics.seeds
//     };
//     plant.sunExposure = req.body.sun_exposure || plant.sunExposure;

//     // Save the updated plant
//     await plant.save();
//     res.redirect(`/plant-details/${plantId}`);  // Redirect to the updated plant details page

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// }

// UPDATE DATA
exports.updatePlantIdentification = async (req, res) => {
  try {
    // Extract the plant ID from the request body
    const plantId = req.body.plant_id;

    // Find the existing plant record
    const plant = await plantModel.findById(plantId);
    if (!plant) {
      return res.status(404).json({ message: "Plant record not found." });
    }

    // Update fields from the form only if they exist
    if (req.body.plant_name) {
      plant.identification.name = req.body.plant_name;
    }
    if (req.body.plant_status) {
      plant.identification.status = req.body.plant_status;
    }
    if (req.body.date_time_seen) {
      plant.date = req.body.date_time_seen;
    }
    if (req.body.description) {
      plant.description = req.body.description;
    }
    if (req.body.latitude) {
      plant.latitude= req.body.latitude
    }
    if (req.body.longitude) {
      plant.latitude= req.body.latitude
    }
    if (req.body.plant_height && req.body.plant_spread) {
      plant.size = {
        height: req.body.plant_height,
        spread: req.body.plant_spread
      };
    }
    if (req.body.flowers !== undefined) {  // Assuming 'false' is a valid input
      plant.characteristics.flowers = req.body.flowers === 'true';
    }
    if (req.body.leaves !== undefined) {
      plant.characteristics.leaves = req.body.leaves === 'true';
    }
    if (req.body.fruits !== undefined) {
      plant.characteristics.fruits = req.body.fruits === 'true';
    }
    if (req.body.thorns !== undefined) {
      plant.characteristics.thorns = req.body.thorns === 'true';
    }
    if (req.body.seeds !== undefined) {
      plant.characteristics.seeds = req.body.seeds === 'true';
    }
    if (req.body.sun_exposure) {
      plant.sunExposure = req.body.sun_exposure;
    }

    // Save the updated plant
    await plant.save();
    res.redirect(`/plant-details/${plantId}`);  // Redirect to the updated plant details page

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}


