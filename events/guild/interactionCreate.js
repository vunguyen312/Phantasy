const profileModel = require('../../models/profileSchema');

module.exports = async (client, Discord, interaction) => {
    
    if(!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if(!command){
        console.error(`Command ${interaction.commandName} doesn't exist.`);
        return;
    }

    const { cooldowns } = client;

    if(!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Discord.Collection());
    }

    const currTime = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const cd = (command.cooldown) * 1000;

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
    try {
        profileData = await profileModel.findOne({ userID: interaction.user.id });
        if (!profileData) {
            let profile = await profileModel.create({
            userID: interaction.user.id,
            allegiance: null,
            rank: 'Lord',
            gold: 0,
            bank: 0,
            citizens: 1,
            growthRate: 1,
            earnRate: 1,
            taxRate: .1,
            job: new Map(),
            notifications: true,

            inventory: new Map()
        });
        profile.save();
        profileData = profile;
        }
    } catch (error) {
        await interaction.reply({ content: 'Uh oh! Something went wrong while setting up your profile!'});
    }

    try {
        await command.execute(interaction, profileData);
    } catch (error) {
        if(interaction.replied || interaction.deferred) {
            await interaction.followUp({ content:'Error while executing command.', ephemeral: true });
        } else {
            await interaction.reply({ content:'Error while executing command.', ephemeral: true });
        }
        console.log(error);
    }
}