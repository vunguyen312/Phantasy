const profileModel = require('../models/profileSchema');
const clanModel = require('../models/clanSchema');
const objectModel = require('../models/objectSchema');

//Condition Codes

module.exports = {
    "0001": {   
    //Check if the command target is calling on a bot
        check: (interaction) => interaction.options.getUser('user').bot, 
        msg: `You can't reference bots!` 
    },
    "0002": {
    //Check if the user has entered a positive integer amount of gold
        check: (interaction, profileData) => {
            const amount = interaction.options.getNumber('amount'); 
            return amount <= 0 || amount > profileData.gold || amount % 1 != 0;
        }, 
        msg: `Please enter a real amount of gold.`
    },
    "0003": {
    //Check if the command target is registered in the database
        check: async (interaction) => !await profileModel.findOne({ userID: interaction.options.getUser('user').id }), 
        msg: `User isn't logged in the database. Get them to run any command.`
    },
    "0004": {
    //Check if the command references the user
        check: (interaction) => interaction.options.getUser('user').id === interaction.user.id, 
        msg: `You can't reference yourself!`
    },
    "0005": {
    //Check if the user has higher permissions
        check: async (interaction) => !(await getObjectData("permissions"))[interaction.user.id], 
        msg: `You do not have the correct permission to access this command.`
    },
    "0006": {
    //Check if the item referenced exists
        check: (interaction, profileData, clanData, itemsList) => !itemsList[interaction.options.getString('item')], 
        msg: `Please enter a valid item.`
    },
    "0007": {
    //Check if the user's clanData is retrievable/exists
        check: (interaction, profileData, clanData) => !clanData, 
        msg: `Could not retrieve your clan information.`
    },
    "0008": {
    //Checks if the user is not in a clan.
        check: (interaction, profileData) => !profileData.allegiance, 
        msg: `Hm... It appears you're not in a civilization.`
    },
    "0009": {
    //Checks if the user is in a clan.
        check: (interaction, profileData) => profileData.allegiance, 
        msg: `You can't run this command while in a civilization.`
    },
    "00010": {
    //Checks if the user is the leader of their civilization.
        check: (interaction, profileData, clanData) => !clanData.leaderID === interaction.user.id, 
        msg: `You need to be the leader of the civilizaiton to perform this command.`
    },
    "0011": {
    //Checks if the command target is in a civilization.
        check: async (interaction) => await profileModel.findOne({ userID: interaction.options.getUser('user').id }).allegiance, 
        msg: `The user you're trying to invite is already in a civilization.`
    },
    "0012": {
    //Checks if clan name exceeds standard character limit.
        check: (interaction) => interaction.options.getString('name').length > 20, 
        msg: `Max Character Limit: 20`
    },
    "0013": {
    //Checks if clan name contains non-alphabetical characters.
        check: (interaction) => !/^[a-zA-Z]+$/.test(interaction.options.getString('name')), 
        msg: `Non-alphabetical characters cannot be used in your civilization name.`
    },
    "0014": {
    //Checks if a clan already exists with the same name.
        check: async (interaction) => await clanModel.findOne({ clanName: interaction.options.getString('name') }), 
        msg: `A civilization with this name already exists!`
    },
    "0015": {
    //Checks if a clan already exists in the server of founding.
        check: async (interaction) => await clanModel.findOne({ serverID: interaction.guild.id }), 
        msg: `A civilization has already been founded in this server!`
    },
    "0016": {
    //Checks if the user is the leader of their clan and is trying to leave.
        check: (interaction, profileData, clanData) => clanData.leaderID === interaction.user.id, 
        msg: `You cannot perform this command while being the leader of a clan. Try /disband`
    },
    "0017": {
    //Check if the player has minimum of 10,000 gold to found a deity.
        check: (interaction, profileData) => profileData.gold < 10_000, 
        msg: `You need 🧈 10,000 gold to found a deity!`
    },
    "0018": {
    //Check if the player has already oathed a deity.
        check: (interaction, profileData) => profileData.oath !== "Wanderer", 
        msg: `The path you've chosen is set in stone...`
    }
}