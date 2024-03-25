const profileModel = require('../../models/profileSchema');
const clanModel = require('../../models/clanSchema');
const fs = require('fs');
const { jsonMap } = require('../../utilities/jsonParse');

const checkConditions = async (conditions, interaction, profileData) => {
    //Wrap the conditions in a promise because of the async conditions
    const conditionResults = await Promise.all(conditions.map(async condition => {
      const result = await condition.check(interaction, profileData);
      return { result, msg: condition.msg };
    }));
  
    return conditionResults.find((condition) => condition.result);
}

const getPlayerData = async (interaction) => {
    const playerStats = {
        userID: interaction.user.id,
        rank: 'Lord',
        gold: 0,
        bank: 0,
        productionScore: 1,
        citizens: 1,
        growthRate: 1,
        earnRate: 10,
        taxRate: .1,
        jobs: new Map(),
        structures: new Map(),
        notifications: true,
        oath: 'Wanderer',
        inventory: new Map()
    }
    
    try {

        const profileData = await profileModel.findOne({ userID: interaction.user.id }) || 
        await profileModel
        .create(playerStats)
        .save();

        return profileData;

    } catch (error) {
        await interaction.reply({ content: 'Uh oh! Something went wrong while setting up your profile!'});
    }
}

module.exports = async (client, Discord, interaction) => {
    
    if(!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if(!command) return console.error(`Command ${interaction.commandName} doesn't exist.`);

    const { cooldowns } = client;
    
    //Check for command cooldown

    if(!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Discord.Collection());
    
    const currTime = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const cd = command.cooldown * 1000;

    const expireTime = timestamps.has(interaction.user.id)
    ? timestamps.get(interaction.user.id) + cd
    : 0;

    if (currTime < expireTime){
        const expiredTimestamp = Math.round(expireTime / 1000);
        return interaction.reply({ content: `Slow down! \`${command.data.name}\` is usable <t:${expiredTimestamp}:R>.`, ephemeral: true});
    }

    timestamps.set(interaction.user.id, currTime);
    setTimeout(() => timestamps.delete(interaction.user.id), cd);

    const profileData = await getPlayerData(interaction);
    const clanData = await clanModel.findOne({ clanName: profileData.allegiance });

    //Conditions checking

    const failedCondition = command.conditions
    ? await checkConditions(command.conditions, interaction, profileData)
    : false;

    if(failedCondition) return interaction.reply({ content: failedCondition.msg, ephemeral: true });

    try {

        await command.execute(interaction, profileData, clanData, jsonMap.items);
        
    } catch (error) {
        (interaction.replied || interaction.deferred) 
        ? await interaction.followUp({ content:'Error while executing command.', ephemeral: true })
        : await interaction.reply({ content:'Error while executing command.', ephemeral: true });
        console.error(error);
    }
}