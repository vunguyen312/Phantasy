const mongoose = require('mongoose');

const objectSchema = new mongoose.Schema({
    //Schema for data that is used as templates for objects or otherwise
    identifier: { type: String, require: true },
    data: { type: Object || Array, require: true }
});

module.exports = mongoose.model('ObjectModels', objectSchema);