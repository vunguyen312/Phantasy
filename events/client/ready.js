const { ActivityType } = require('discord.js');
const profileModel = require('../../models/profileSchema');
const { checkTime } = require('./on-start/hourlyPay');

module.exports = async (client) => {
    console.log("Phantasy is online!");
    client.user.setActivity(`${client.guilds.cache.size} servers.`, { type: ActivityType.Watching });

    //Update gold every hour

    await checkTime(new Date(Date.now()).getHours());

}