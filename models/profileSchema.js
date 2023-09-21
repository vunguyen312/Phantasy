const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true },
    allegiance: { type: String },
    rank: { type: String },
    gold: { type: Number },
    bank: { type: Number },

    //Inventory

    inventory: { type: Map }

});

module.exports = mongoose.model('ProfileModels', profileSchema);