const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true },
    serverID: {type: String, require: true },
    allegiance: {type: String, require: true},
    rank: { type: String, require: true },
    gold: { type: Number },
    bank: { type: Number },

    //Inventory

});

module.exports = mongoose.model('ProfileModels', profileSchema);