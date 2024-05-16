var express = require('express');
const path = require('path');
const fs = require('fs');


var router = express.Router();

// Import the controller functions
const { create, getAllPlants, getSelectedPlant, getSortedPlants, updatePlantIdentification } = require('../controllers/plantController');


var multer = require('multer');

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

// let upload = multer({ storage: storage });
const upload = multer({
  limits: {
    fieldNameSize: 100,        // Max field name size
    fieldSize: 1024 * 1024 * 10, // 10 MB (max field value size)
    fileSize: 1024 * 1024 * 10, // 10 MB (for files)
    
  },
  storage: storage
});

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const plants = await getAllPlants(); // Fetch all plants
    res.render('index', { title: 'Plant Sightings', correct_submission: 'true', plants }); // Render the 'plants.ejs' view with plants data
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/plants', async function(req, res, next) {
  const plants = getAllPlants();

  plants.then((data) => {
    res.status(200).json(data);
  });

  plants.catch((err) => {
    res.status(500).send(err);
  });

});

router.get('/login', async function(req, res, next) {
  res.render('username')
})

// GET plant details page
router.get('/plant', function(req, res, next) {
  let plant_id = req.query.id;
  let result = getSelectedPlant(plant_id);


  result.then(plant => {
    const plantResource = plant[0].identification.name.replaceAll(" ", "_");
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
      species: ""
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

router.get('/add-plant', function(req, res, next) {
  res.render('form', { title: 'Add Plant' });
});

router.post('/add-plant', upload.single('upload_photo'), async function(req, res, next) {
  console.log("saw", req.body);
  let filePath;
  if (req.file) {
    filePath = req.file.path;
  } 
  else {
    filePath = await saveBase64Image(req.body.base64Image);
    // filePath = req.body.base64Image;
  }
  // console("filepath", filePath)
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
      status: "In Progress"//req.body.identification_name,
    },
    sunExposure: req.body.sun_exposure,
    // flowersColour: req.body.flowers_colour,
    // Handling for file upload will be required here for `photo`
    user: req.body.user_nickname
  }, filePath);

  res.redirect('/');
});

// async function saveBase64Image(base64String) {
//   // Remove the data:image/jpeg;base64, prefix from the base64 string
//   const base64Data = base64String.replace(/^data:image\/jpeg;base64,/, '');

//   // // Generate a unique filename for the image
//   const fileName = Date.now() + '.jpg';
//   // const filePath = path.join('localhost:3000', 'public', 'images', 'uploads', fileName);
//   const filePath = path.join(__dirname, '..', 'public', 'images', 'uploads', fileName);

//   // Decode the base64 string to binary data
//   const decodedData = Buffer.from(base64Data, 'base64');

//   // Write the binary data to a file on the server's file system
//   await fs.promises.writeFile(filePath, decodedData);

//   return "public/images/uploads/"+fileName;
// }

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

router.get('/update-plant', function(req, res, next) {
  let plant_id = req.query.id;
  //plant_id.then(plantID => {
  res.render('update_plant', { plantID: plant_id });
});

router.post('/update-plant', upload.single('upload_photo'), async function(req, res, next) {
  let plant_id = req.body.plant_id;
  let filePath;

  if (req.file) {
    filePath = req.file.path;
  }

  console.log("butter", filePath, req.file);

  await updatePlantIdentification(req, res, filePath); // await the async function

  res.redirect(`/plant?id=${plant_id}`);
});


module.exports = router;
