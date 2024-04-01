const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const profileModel = require('../../models/profileSchema');
const { modifyValue } = require('../../utilities/dbQuery');
const { getObjectData } = require('../../utilities/dbQuery');

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('explore')
        .setDescription(`Explore and bring back some loot.`),
    syntax: '/explore',
    conditions: [],
    async execute(interaction, profileData) {

        const scenarioTable = await getObjectData("loot");

        const randomScenario = scenarioTable[Math.floor(Math.random() * (scenarioTable.length - 1))];
        
        console.log(randomScenario);

        const embed = new EmbedBuilder()
        .setColor(randomScenario.hex)
        .setTitle(`🗺️  ${interaction.user.tag}'s Adventure`)
        .setDescription(randomScenario.msg)
        .setImage(randomScenario.img);
        /*.setFields(
            { name: randomLoot.amount > 0 ? '🧈 Gold Deposited:' : '🧈 Gold Taken:', value: `${ randomLoot.amount }`, inline: true},
            { name: '\u200B', value: '\u200B', inline: true },
            { name: '💰 New Balance:', value: `${ profileData.gold + randomLoot.amount }`, inline: true }
        )*/

        /*await modifyValue(
            { userID: interaction.user.id },
            { $inc: { gold: randomLoot.amount } }
        );*/

        await interaction.reply({ embeds: [embed] });
    }
}