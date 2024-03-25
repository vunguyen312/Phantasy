const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const profileModel = require('../../models/profileSchema');
const { modifyValue } = require('../../utilities/dbQuery');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription(`Withdraw your coins from the bank.`)
        .addNumberOption(option =>
            option
            .setName('amount')
            .setDescription('The amount of coins to withdraw.')
            .setRequired(true)),
    syntax: '/withdraw <amount>',
    conditions: [
        {check: (interaction, profileData) => {const amount = interaction.options.getNumber('amount'); return amount <= 0 || amount > profileData.bank || amount % 1 != 0;}, msg: `Please withdraw a real amount of gold.`}
    ],
    async execute(interaction, profileData){
        
        const amount = interaction.options.getNumber('amount');

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`💰 ${interaction.user.tag} has withdrawn gold`)
        .setFields(
            { name: '🧈 Gold Withdrawn:', value: `${ amount }`},
            { name: '🏦 New Balance:', value: `${ profileData.bank - amount }`}
        )
        .setThumbnail(interaction.user.displayAvatarURL());

        await modifyValue(
            { userID: interaction.user.id },
            { $inc: { gold: amount, bank: -amount } }
        );

        await interaction.reply({ embeds: [embed] });
    }
}