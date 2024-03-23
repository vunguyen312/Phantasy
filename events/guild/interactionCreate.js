const profileModel = require('../../models/profileSchema');
const clanModel = require('../../models/clanSchema');
const fs = require('fs');
const { jsonMap } = require('../../utilities/jsonParse');

module.exports = async (client, Discord, interaction) => {
    
    if(!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if(!command) return console.error(`Command ${interaction.commandName} doesn't exist.`);

    const { cooldowns } = client;

    if(!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Discord.Collection());
    }

    const currTime = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const cd = command.cooldown * 1000;

    if(timestamps.has(interaction.user.id)){
        const expirTime = timestamps.get(interaction.user.id) + cd;

        if(currTime < expirTime){
            const expiredTimestamp = Math.round(expirTime / 1000);
            return interaction.reply({ content: `Slow down! \`${command.data.name}\` is usable <t:${expiredTimestamp}:R>.`, ephemeral: true});
        }
    }

    timestamps.set(interaction.user.id, currTime);
    setTimeout(() => timestamps.delete(interaction.user.id), cd);

    let profileData;

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
        profileData = await profileModel.findOne({ userID: interaction.user.id });
        if (!profileData) {
            const profile = await profileModel.create(playerStats);
            profile.save();
            profileData = profile;
        }
    } catch (error) {
        await interaction.reply({ content: 'Uh oh! Something went wrong while setting up your profile!'});
    }

    const clanData = await clanModel.findOne({ clanName: profileData.allegiance });

    const failedCondition = command.conditions ?
      (await Promise.all(
          command.conditions.map(async condition => ({
            result: await condition.check(interaction, profileData),
            msg: condition.msg,
          }))
        )
      ).find(condition => condition.result)
      : false;

    if (failedCondition) return interaction.reply({ content: failedCondition.msg, ephemeral: true });

    try {
        await command.execute(interaction, profileData, clanData, jsonMap.items);
    } catch (error) {
        (interaction.replied || interaction.deferred) ?
        await interaction.followUp({ content:'Error while executing command.', ephemeral: true })
        :   
        await interaction.reply({ content:'Error while executing command.', ephemeral: true });
        console.log(error);
    }
}