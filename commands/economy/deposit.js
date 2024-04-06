const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { modifyValue } = require('../../utilities/dbQuery');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription(`Deposit your coins into the bank.`)
        .addNumberOption(option =>
            option
            .setName('amount')
            .setDescription('The amount of coins to despoit.')
            .setRequired(true)),
    syntax: '/deposit <amount>',
    conditions: ["0002"],
    async execute(interaction, profileData){

        const amount = interaction.options.getNumber('amount'); 
        
        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`💰 ${interaction.user.tag} has deposited gold`)
        .setFields(
            { name: '🧈 Gold Deposited:', value: `${ amount }`},
            { name: '🏦 New Balance:', value: `${ profileData.bank + amount }`}
        )
        .setThumbnail(interaction.user.displayAvatarURL());

        await modifyValue(
            "profile",
            { userID: interaction.user.id },
            { $inc: { gold: -amount, bank: amount } }
        );

        await interaction.reply({ embeds: [embed] });
    }
}