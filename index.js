const Discord = require("discord.js");
require('dotenv').config();
const client = new Discord.Client({intents: ["Guilds", "GuildMessages", "MessageContent"]});
const mongoose = require('mongoose');

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.cooldowns = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
    console.log(`✓ ${handler} has loaded.`);
});

mongoose.connect(process.env.MONGODB_SRV, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() =>{
    console.log('✓ Connected to database.');
}).catch(error =>{
    console.log(error);
});



client.login(process.env.CLIENT_TOKEN);