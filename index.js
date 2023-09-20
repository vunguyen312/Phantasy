const Discord = require("discord.js");
require('dotenv').config();
const client = new Discord.Client({intents: ["Guilds", "GuildMessages", "MessageContent"]});

client.commands = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
    console.log(`${handler} has loaded.`);
});

client.on(Discord.Events.InteractionCreate, async interaction =>{
    if(!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if(!command){
        console.error(`Command ${interaction.commandName} doesn't exist.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        if(interaction.replied || interaction.deferred) {
            await interaction.followUp({ content:'Error while executing command.', ephemeral: true });
        } else {
            await interaction.reply({ content:'Error while executing command.', ephemeral: true });
        }
    }
});

client.login(process.env.CLIENT_TOKEN);







































