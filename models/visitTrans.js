const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create Visit Transaction History
const repVisitsSchema = new Schema({
    vendorId:{
        type: Schema.Types.ObjectId,
        ref:'Vendor'
    },
    repId:{
        type: Schema.Types.ObjectId,
        ref: 'VendorRep'
    },
    staffId:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    vendorName:{
        type: String,
        required: [true, "Vendor Company Name field is required/mandatory"]    
    },
    vendorPhoneNo: {
        type: String,
        //required: [true, "Contact Number is required/mandatory"]
      },    
    repName:{
        type: String,
        required: [true, "Vendor Name field is required/mandatory"]
    },
    repPhoneNo: {
        type: String,
        //required: [true, "Contact Number is required/mandatory"]
    },
    staffName:{
        type: String,
        required: true            
    },
    staffPhoneNo: {
        type: Number,
        //required: true    
    },
    visitDate:{
        type: Date,
        default: Date.now    
    },
    visitStatus: {
        type: String,
        enum: ['Raised','StaffApproved','StaffRejected','SecurityRejected','SecurityApproved', 'TimeoutReject'],
        default: 'Raised'
    },
});

// Collection names in MongoDB: vendors, vendors_rep
// Methods exported: Vendor, VendorRep
const VisitHistory = mongoose.model('visitHistory', repVisitsSchema);
//module.exports = {Vendor, VendorRep};
module.exports = VisitHistory;
