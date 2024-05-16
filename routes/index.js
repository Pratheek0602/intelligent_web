var express = require('express');
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

let upload = multer({ storage: storage });

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

router.post('/add-plant', async function(req, res, next) {
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
      photo: req.body.base64Image,
      // Handling for file upload will be required here for `photo`
      user: req.body.user_nickname
    });
  
    res.redirect('/');
  });
  

// router.post('/add-plant', upload.single('upload_photo'), async function(req, res, next) {
//   console.log(req);
//   // let filePath = req.file.path;
//   await create({
//     date: req.body.date_time_seen,
//     longitude: req.body.longitude,
//     latitude: req.body.latitude,
//     description: req.body.description,
//     size: {
//       height: req.body.plant_height,
//       spread: req.body.plant_spread
//     },
//     characteristics: {
//       flowers: req.body.flowers === "Flowers",
//       leaves: req.body.leaves === "Leaves",
//       fruits: req.body.fruits === "Fruits",
//       thorns: req.body.thorns === "Thorns",
//       seeds: req.body.seeds === "Seeds",
//     },
//     identification: {
//       name: req.body.identification_name,
//       status: "In Progress"//req.body.identification_name,
//     },
//     sunExposure: req.body.sun_exposure,
//     // flowersColour: req.body.flowers_colour,
//     // Handling for file upload will be required here for `photo`
//     user: req.body.user_nickname
//   }, filePath);

//   res.redirect('/');
// });

router.get('/update-plant', function(req, res, next) {
  let plant_id = req.query.id;
  //plant_id.then(plantID => {
  res.render('update_plant', { plantID: plant_id });
});

router.post('/update-plant', function(req, res, next) {
  let plant_name = req.body.plant_name;
  console.log("Plant name - ", plant_name);

  let plant_status = req.body.plant_status;
  let date = req.body.date_time_seen;
  let desc = req.body.description;
  let lat = req.body.latitude;
  let long = req.body.longitude;
  let height = req.body.plant_height;
  let spread = req.body.plant_spread;
  let flowers = req.body.flowers;
  let leaves = req.body.leaves;
  let fruits = req.body.fruits;
  let thorns = req.body.thorns;
  let seeds = req.body.seeds;
  let sunExposure = req.body.sun_exposure;

  console.log("Plant status -", plant_status)

  let plant_id = req.body.plant_id;

  // do something with the new values - update the DB record

  updatePlantIdentification(req, res) // pass arguments

  res.redirect(`/plant?id=${plant_id}`);
});


module.exports = router;

// 
