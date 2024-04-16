const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    identifier: { type: String, require: true, unique: true },
    userID: { type: String, require: true },
    itemCode: { type: String, require: true },
    data: { type: Object || Array, require: true }
});

module.exports = mongoose.model('ItemModels', itemSchema);