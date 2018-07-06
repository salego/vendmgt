const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Staff = require('./user') //To Store user/staff id in Vendor Representative

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
  },
  reps:[{
    type: Schema.Types.ObjectId,
    ref:'VendorRep'
 }]
});

//Sub schema under vendorRepSchema to include visits
const vistDetailsSchema = new Schema({
  staff_id: {
    type: Schema.Types.ObjectId,
    ref:'Staff' //Object ID from 'users' dict with role as 'staff' 
  },
  visitDate: {
    type: Date,
    default: Date.now
  },
  visitStatus: {
    type: String,
    enum: ['raised','approved','rejected','timeout'],
    default: 'raised'
  } 
});


//Create representatives from company
const vendorRepSchema = new Schema({
  name:{
    type: String,
    required: [true, "Vendor Name field is required/mandatory"]
  },
  phoneNo: {
    type: String,
    required: [true, "Contact Number is required/mandatory"]
  },
  photoIdType:{
    type: String,
    enum: ['Aadhar ID','Driving license','Voter ID','Ration Card']
  },
  photoId:{
    type: String
  },
  entryRestricted:{
    type: Boolean,
    default: false
  },
  photoPath:{
    type: String
  },
  vendor_id:{
    type: Schema.Types.ObjectId,
    ref:'Vendor'
  },
  visitDetails: vistDetailsSchema
});

// Collection names in MongoDB: vendors, vendors_rep
// Methods exported: Vendor, VendorRep
const Vendor = mongoose.model('vendors',VendorsSchema );
const VendorRep = mongoose.model('vendors_rep', vendorRepSchema);
module.exports = {Vendor, VendorRep};
