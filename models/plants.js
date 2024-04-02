let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let PlantSchema = new Schema({
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String, max: 300, required: true },
  size: {
    height: { type: Number, required: true },
    spread: { type: Number, required: true },
  },
  characteristics: {
    flowers: { type: String, required: true },
    leaves: { type: String, required: true },
    fruits: { type: String, required: true },
    seeds: { type: String, required: true },
    sun: { type: String, required: true },
  },
  identification: {
    name: { type: String, required: true },
    status: { type: String, required: true },
  },
  photo: { type: String, required: true },
  user: { type: String, required: true },
});

PlantSchema.set('toObject', { getters: true, virtuals: true });

// let Plant = mongoose.model('plants', PlantSchema);
// module.exports = Plant;
module.exports = mongoose.model('plants', PlantSchema);


