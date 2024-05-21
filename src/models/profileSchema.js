const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({

    //User

    userID: { type: String, require: true, unique: true },
    exp: { type: Number, require: true },
    oath: { type: String, require: true},
    notifications: { type: Boolean, require: true },

    //Economy

    gold: { type: Number, require: true },
    bank: { type: Number, require: true },
    maxBank: { type: Number, require: true },
    
    //Clan

    allegiance: { type: String, require: true },
    rank: { type: String, require: true },

    //Combat

    class: { type: Map, require: true },
    weapon: { type: String, require: true },
    battleStats: { type: Object, require: true },
    activeSpells: { type: Object, require: true },

    //Inventory

    inventory: { type: Map, require: true }

});

module.exports = mongoose.model('ProfileModels', profileSchema);