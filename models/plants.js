let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let PlantSchema = new Schema({
  date: { type: Date, required: true },
  location: { type: Date, required: true },
  description: { type: String, max: 300, required: true },
  size: {
    height: { type: Number, required: true },
    spread: { type: Number, required: true },
  },
  characteristics: {
    flowers: { type: Boolean, required: true },
    leaves: { type: Boolean, required: true },
    fruits: { type: Boolean, required: true },
    seeds: { type: Boolean, required: true },
    sun: { type: String, required: true },
  },
  identification: {
    name: { type: String, required: true },
    status: { type: Boolean, required: true },
  },
  photo: { type: String, required: true },
  user: { type: String, required: true },
});

PlantSchema.set('toObject', { getters: true, virtuals: true });

let Plant = mongoose.model('plant', PlantSchema);

module.exports = Plant;
