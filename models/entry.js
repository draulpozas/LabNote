const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let entrySchema = new Schema({
    title:{type:String, required:[true, 'please provide a title for the entry']},
    body:{type:String},
    yield:{type:Number},
    productid:{type:mongoose.Types.ObjectId}
});

module.exports = mongoose.model('Entry', entrySchema);