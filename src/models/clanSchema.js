const mongoose = require('mongoose');

const clanSchema = new mongoose.Schema({
    clanName: { type: String, require: true, unique: true },
    leaderID: { type: String, require: true, unique: true },
    serverID: { type: String, require: true, unique: true },
    public: { type: Boolean, require: true },
    members: { type: Object, require: true },
    productionScore: { type: Number, require: true },
    growthRate: { type: Number, require: true },
    earnRate: { type: Number, require: true },
    taxRate: { type: Number, require: true },
    
    //Clan Resources
    
    citizens: { type: Number, require: true },
    structures: { type: Map, require: true },
    deity: { type: Object },
    inventory: { type: Map }
});

module.exports = mongoose.model('ClanModels', clanSchema);