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
            { amount: 10, msg: `As you tripped over a tree root, you discover 🥇 5 gold coins! Lucky stumble!`},
            { amount: 8, msg: `While dodging a falling branch, you stumbled upon 🥇 8 gold coins! Fortune favors the agile!`},
            { amount: 16, msg: `Along the glinting marble mountains, you find 🥇 16 gold coins glinting in the sunlight! A fortunate discovery!`},
            { amount: 80, msg: `A wealthy noble wishes to curry your favour with a gift of 🥇 80 gold coins! Friend or foe, his smile holds an ulterior motive...`},
            { amount: -10, msg: `Rats! A horde of bandits threaten your wealth, leaving behind 🥇 10 gold coins as you flee!`},
        ];

        const randomLoot = lootTable[Math.floor(Math.random() * (lootTable.length - 1))];

        const embed = new EmbedBuilder()
        .setColor(randomLoot.amount > 0 ? "Green" : "Red")
        .setTitle(`📝 Exploration Results`)
        .setDescription(randomLoot.msg)
        .setFields(
            { name: randomLoot.amount > 0 ? '🧈 Gold Deposited:' : '🧈 Gold Taken:', value: `${ randomLoot.amount }`},
            { name: '💰 New Balance:', value: `${ profileData.gold + randomLoot.amount }`}
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