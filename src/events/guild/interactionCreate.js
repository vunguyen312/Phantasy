const profileModel = require('../../models/profileSchema');
const clanModel = require('../../models/clanSchema');
const { createNewPlayer, getObjectData } = require('../../utilities/dbQuery');
const conditionsMap = require('../../utilities/conditions');

const checkConditions = async (conditions, interaction, profileData, clanData, itemsList) => {
    for (const code of conditions) {
        const condition = conditionsMap[code];
        const result = await condition.check(interaction, profileData, clanData, itemsList);
        if (result) return { result, msg: condition.msg };
    }

    return false; 
}

const getPlayerData = async (interaction) => {
    try {

        const profileData = await profileModel.findOne({ userID: interaction.user.id }) 
        || await createNewPlayer(interaction);

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

    const expireTime = timestamps.get(interaction.user.id) + cd || 0;

    if (currTime < expireTime){
        const expiredTimestamp = Math.round(expireTime / 1000);
        return interaction.reply({ content: `Slow down! \`${command.data.name}\` is usable <t:${expiredTimestamp}:R>.`, ephemeral: true});
    }

    timestamps.set(interaction.user.id, currTime);
    setTimeout(() => timestamps.delete(interaction.user.id), cd);

    const profileData = await getPlayerData(interaction);
    const clanData = await clanModel.findOne({ clanName: profileData.allegiance });
    const itemsList = await getObjectData("items");

    //Conditions checking

    const failedCondition = await checkConditions(command.conditions, interaction, profileData, clanData, itemsList);

    if(failedCondition) return interaction.reply({ content: failedCondition.msg, ephemeral: true });

    try {

        await command.execute(interaction, profileData, clanData, itemsList);
        
    } catch (error) {
        interaction.replied || interaction.deferred 
        ? await interaction.followUp({ content:'Error while executing command.', ephemeral: true })
        : await interaction.reply({ content:'Error while executing command.', ephemeral: true });
        console.error(error);
    }
}