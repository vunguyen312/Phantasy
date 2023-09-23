const { ActivityType } = require('discord.js');

module.exports = async client =>{
    console.log("CivSim is online!");
    client.user.setActivity(`${client.guilds.cache.size} servers.`, { type: ActivityType.Watching });
}