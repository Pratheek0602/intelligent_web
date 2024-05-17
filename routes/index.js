var express = require('express');
const path = require('path');
const fs = require('fs');
var router = express.Router();

const { create, getAllPlants, getSelectedPlant, updatePlantIdentification } = require('../controllers/plantController');

var multer = require('multer');
// Configure multer disk storage for file uploads.
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/images/uploads/');
  },
  filename: function(req, file, cb) {
    var original = file.originalname;
    var file_extension = original.split(".");
    var filename = Date.now() + '.' + file_extension[file_extension.length - 1];
    cb(null, filename);
  }
});

// Configure multer upload settings.
const upload = multer({
  limits: {
    fieldNameSize: 100,        // Max field name size
    fieldSize: 1024 * 1024 * 10, // 10 MB (max field value size)
    fileSize: 1024 * 1024 * 10, // 10 MB (for files)

  },
  storage: storage
});

/**
 * Route for rendering the home page.
 * Fetches all plants and renders the 'index' view with plants data.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
router.get('/', async function(req, res, next) {
  try {
    const plants = await getAllPlants(); // Fetch all plants
    res.render('index', { title: 'Plant Sightings', correct_submission: 'true', plants }); // Render the 'plants.ejs' view with plants data
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * Route for fetching all plants.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
router.get('/plants', async function(req, res, next) {
  const plants = getAllPlants();

  plants.then((data) => {
    res.status(200).json(data);
  });

  plants.catch((err) => {
    res.status(500).send(err);
  });
});

/**
 * Route for rendering the login page.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
router.get('/login', async function(req, res, next) {
  res.render('username')
})

/**
 * GET plant details page.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
router.get('/plant', function(req, res, next) {
  let plant_id = req.query.id;
  let result = getSelectedPlant(plant_id);

  result.then(plant => {
    // const plantResource = plant[0].identification.name.trim().replaceAll(" ", "_");
    const plantResource = plant && plant[0] && plant[0].identification && plant[0].identification.name ? plant[0].identification.name.trim().replaceAll(" ", "_") : "";
    const resourceURL = `http://dbpedia.org/resource/${plantResource}`

    console.log(resourceURL)
    const endpointUrl = 'http://dbpedia.org/sparql'

    const sparqlQuery = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbp: <http://dbpedia.org/property/>
  
    SELECT ?comment ?genus ?species
    WHERE {
    <${resourceURL}> dbp:genus ?genus .
    <${resourceURL}> dbp:species ?species .
    <${resourceURL}> rdfs:comment ?comment .
    FILTER(langMatches(lang(?comment), "en")) .
    }`;

    const encodedQuery = encodeURIComponent(sparqlQuery);

    const fetchURL = `${endpointUrl}?query=${encodedQuery}&format=json`;

    let fetchPromise = fetch(fetchURL);

    let dbpediaResponse = {
      comment: "",
      genus: "",
      species: "",
      url: resourceURL
    };

    fetchPromise.catch((e) => {
      console.log(`Couldnt fetch, failed with error ${e}`)
      res.render('plant_details', {
        title: 'Plant Details',
        data: plant[0],
        found: false,
        dbpedia: dbpediaResponse
      });
    })

    fetchPromise.then(fetchRes => fetchRes.json()).then(data => {
      bindings = data.results.bindings;
      let plantFound = false;
      if (!bindings || bindings.length != 0) {
        plantFound = true;
        dbpediaResponse.comment = bindings[0].comment.value;
        dbpediaResponse.genus = bindings[0].genus.value;
        dbpediaResponse.species = bindings[0].species.value;
      }

      res.render('plant_details', {
        title: 'Plant Details',
        data: plant[0],
        found: plantFound,
        dbpedia: dbpediaResponse
      })
    })

  })
});


/**
 * GET add plant page.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
router.get('/add-plant', function(req, res, next) {
  res.render('form', { title: 'Add Plant' });
});

/**
 * POST request to add a new plant.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
router.post('/add-plant', upload.single('upload_photo'), async function(req, res, next) {
  console.log("saw", req.body);
  let filePath;
  if (req.file) {
    filePath = req.file.path;
  }
  else {
    filePath = await saveBase64Image(req.body.base64Image);
  }
  await create({
    date: req.body.date_time_seen,
    longitude: req.body.longitude,
    latitude: req.body.latitude,
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
      status: "In Progress"
    },
    sunExposure: req.body.sun_exposure,
    user: req.body.user_nickname
  }, filePath);

  res.redirect('/');
});

/**
 * Saves a base64 encoded image to the server's file system.
 * @param {string} base64String - Base64 encoded image string.
 * @returns {string} - File path where the image is saved.
 * @throws {Error} - If the base64 string is invalid or missing image format.
 */
async function saveBase64Image(base64String) {
  // Extract the image format (e.g., jpeg, png) from the base64 string
  const matches = base64String.match(/^data:image\/([a-zA-Z+]+);base64,/);
  if (!matches) {
    throw new Error('Invalid base64 string: missing image format');
  }
  const imageFormat = matches[1];

  // Remove the data:image/jpeg;base64, prefix from the base64 string
  const base64Data = base64String.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

  // Generate a unique filename for the image
  const fileName = Date.now() + '.' + imageFormat;
  const filePath = path.join(__dirname, '..', 'public', 'images', 'uploads', fileName);

  // Decode the base64 string to binary data
  const decodedData = Buffer.from(base64Data, 'base64');

  // Write the binary data to a file on the server's file system
  await fs.promises.writeFile(filePath, decodedData);

  return "public/images/uploads/" + fileName;
}

/**
 * GET route to render the update plant page.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
router.get('/update-plant', function(req, res, next) {
  let plant_id = req.query.id;
  //plant_id.then(plantID => {
  res.render('update_plant', { plantID: plant_id });
});

/**
 * POST route to update plant identification details.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
router.post('/update-plant', upload.single('upload_photo'), async function(req, res, next) {
  let plant_id = req.body.plant_id;
  let filePath;
  if (req.file) {
    filePath = req.file.path;
  }

  updatePlantIdentification(req, res, filePath); // await the async function
  res.redirect(`/plant?id=${plant_id}`);
});


module.exports = router;
