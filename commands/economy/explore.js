const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('explore')
        .setDescription(`Explore and bring back some loot!`),
    conditions: [],
    async execute(interaction, profileData) {

        const lootTable = [
            { amount: 10, msg: `You searched and found 10 gold!`}
        ];

        const randomLoot = lootTable[Math.round(Math.random(0, lootTable.length - 1))];

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`📝 Exploration Results`)
        .setDescription(randomLoot.msg)
        .setFields(
            { name: '🧈 Gold Deposited:', value: `${ randomLoot.amount }`},
            { name: '🏦 New Balance:', value: `${ profileData.gold + randomLoot.amount }`}
        )
        .setThumbnail(interaction.user.displayAvatarURL());

        try{
            await profileModel.findOneAndUpdate(
                { userID: interaction.user.id },
                { $inc: { gold: randomLoot.amount } }
            );
        } catch (error) {
            console.log(`There was an error updating the database.`);
        }

        await interaction.reply({ embeds: [embed] });
    }
}