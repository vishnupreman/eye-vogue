const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    addressDetails: [
        {
            address: {
                type: String,
               
            },
            country: {
                type: String,
                
            },
            state: {
                type: String,
               
            },
            city: {
                type: String,
                
            },
            landmark: {
                type: String,
                
            },
            pincode: {
                type: String,
            },
            name:{
                type:String
            }
        }
    ]
}, {
    timestamps: true
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
