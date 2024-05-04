const profileModel = require('../models/profileSchema');
const clanModel = require('../models/clanSchema');
const objectModel = require('../models/objectSchema');
const itemModel = require('../models/itemSchema');
const { showLevel } = require('./embedUtils');

const createNewPlayer = async (interaction) => {
    const battleStats = {
        health: 100,
        ichor: 100,
        defense: 10,
        speed: 50,
        physRes: 0,
        ichorRes: 0,
        physAtk: 10,
        ichorAtk: 10,
        willpower: 5
    };

    const playerStats = {
        userID: interaction.user.id,
        exp: 0,
        rank: 'Lord',
        gold: 0,
        bank: 0,
        maxBank: 10000,
        productionScore: 1,
        citizens: 1,
        growthRate: 1,
        earnRate: 10,
        taxRate: .1,
        jobs: new Map(),
        structures: new Map(),
        notifications: true,
        oath: 'Wanderer',
        inventory: new Map(),
        battleStats: battleStats,
        weapon: 'None'
    }

    try{

        const newPlayer = await profileModel.create(playerStats);

        newPlayer.save();

        return newPlayer;

    } catch(error) {
        console.error(error);
    }
}

const updateExp = async (profileData, value, interaction) => {
    try{

        await showLevel(profileData.exp + value, profileData.exp, interaction);

        await profileModel.findOneAndUpdate(
            { userID: profileData.userID }, 
            { $inc: { exp: value } }
        );

    } catch (error) {
        console.error(error);
    }
}

const modifyValue = async (model, query, operation) => {
    const models = {
        "profile": profileModel,
        "clan": clanModel,
        "object": objectModel
    };

    try{

        await models[model].findOneAndUpdate(query, operation);
        
    } catch (error) {
        console.error(error);
    }
}

const getObjectData = async (table) => {
    try{

        const dataTable = await objectModel.findOne({ identifier: table });
        
        return dataTable.data;

    } catch (error) {
        console.error(error);
    }
}

const createID = async () => {
    const newIdentifier = Math.random().toString(20).substring(2, 8); 

    try{

        const existingData = await itemModel.findOne({ identifier: newIdentifier });

        return existingData ? await createID() : newIdentifier;

    } catch (error) {
        console.log(error);
    }
}

const createItem = async (userID, itemCode, data) => {
    const identifier = await createID();

    const itemData = {
        identifier: identifier,
        userID: userID,
        itemCode: itemCode,
        data: data
    };

    try{

        await itemModel.create(itemData);

        return identifier;

    } catch(error) {
        console.log(error);
    }
}

module.exports = {createNewPlayer, updateExp, modifyValue, getObjectData, createItem}