const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { modifyValue } = require('../../utilities/dbQuery');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription(`Pays out a set amount of gold to a specified user.`)
        .addNumberOption(option =>
            option
            .setName('amount')
            .setDescription('The amount of coins to give.')
            .setRequired(true))
        .addUserOption(option =>
            option
            .setName('user')
            .setDescription('Specify the user to pay.')
            .setRequired(true)),
    syntax: '/pay <amount> <user>',
    conditions: ["0001", "0004", "0002", "0003"],
    async execute(interaction, profileData){

        const amount = interaction.options.getNumber('amount');

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`💰 ${interaction.user.tag} has paid ${interaction.options.getUser('user').username} ${amount} gold`)
        .setFields(
            { name: '🧈 Gold Paid:', value: `${amount}` },
            { name: '🏦 New Balance:', value: `${profileData.gold - amount}` }
        )
        .setThumbnail(interaction.user.displayAvatarURL());

        await modifyValue(
            "profile",
            { userID: interaction.user.id }, 
            { $inc: { gold: -amount } }
        );

        await modifyValue(
            "profile",
            { userID: interaction.options.getUser('user').id }, 
            { $inc: { gold: amount } }
        );

        await interaction.reply({ embeds: [embed] });
    }
}