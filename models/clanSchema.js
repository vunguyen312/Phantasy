const mongoose = require('mongoose');

const clanSchema = new mongoose.Schema({
    clanName: { type: String, require: true, unique: true},
    leaderID: { type: String, require:true, unique: true },
    serverID: { type: String, require:true, unique: true},
    public: { type:Boolean, require: true},
    members: { type: Map, require:true },

    //Clan Resources


    wood: { type: Number },
    stone: { type: Number }
});

module.exports = mongoose.model('ClanModels', clanSchema);