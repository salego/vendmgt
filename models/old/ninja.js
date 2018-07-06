const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create Geo schema
const GeoSchema = new Schema({
  type:{
    type: String,
    default: "Point"
  },
  coordinates:{
    type:[Number],
    index: "2dsphere"
  }
});
//Create ninja schema model
const NinjaSchema = new Schema({
  name:{
    type: String,
    required: [true, "Name field is required/mandatory"]
  },
  rank:{
    type: String
  },
  available:{
    type: Boolean,
    default: false
  },
  geometry: GeoSchema
});

//Create Ninja model (with capitial N to recognize it as model)
//'ninja' parameter is the name of the collection in mongo DB
// Ninja model is based on the schema defined here
const Ninja = mongoose.model('ninja', NinjaSchema);

module.exports = Ninja;
