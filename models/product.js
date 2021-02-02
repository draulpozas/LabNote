const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let productSchema = new Schema({
    name:{type:String, required:[true, 'please provide a product name']},
    formula:{type:String},
    mass:{type:Number},
});

module.exports = mongoose.model('Product', productSchema);