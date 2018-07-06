const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create vendors / company schema model
const VendorsSchema = new Schema({
  company:{
    type: String,
    required: [true, "Vendor Company Name field is required/mandatory"]
  },
  phoneNo: {
    type: String,
    required: [true, "Contact Number is required/mandatory"]
  },
  address:{
    type: String
  },
  entryRestricted:{
    type: Boolean,
    default: false
  }
});


// Collection names in MongoDB: vendors, vendors_rep
// Methods exported: Vendor, VendorRep
const Vendor = mongoose.model('vendors',VendorsSchema );
//const VendorRep = mongoose.model('vendors_rep', vendorRepSchema);
module.exports = Vendor;
