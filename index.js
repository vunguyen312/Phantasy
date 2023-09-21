const Discord = require("discord.js");
require('dotenv').config();
const client = new Discord.Client({intents: ["Guilds", "GuildMessages", "MessageContent"]});
const mongoose = require('mongoose');
const profileModel = require('./models/profileSchema');

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.cooldowns = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
    console.log(`${handler} has loaded.`);
});

mongoose.connect(process.env.MONGODB_SRV, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() =>{
    console.log('Connected to database.');
}).catch((error) =>{
    console.log(error);
})

client.on(Discord.Events.InteractionCreate, async interaction =>{
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
            serverID: interaction.guild.id,
            gold: 0,
            bank: 0,
        });
        profile.save();
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

});

client.login(process.env.CLIENT_TOKEN);







































