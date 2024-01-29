const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription(`Deposit your coins into your bank!`)
        .addNumberOption(option =>
            option
            .setName('amount')
            .setDescription('The amount of coins to despoit.')
            .setRequired(true)),
    conditions: [
        {check: (interaction, profileData) => {const amount = interaction.options.getNumber('amount'); return amount <= 0 || amount > profileData.gold || amount % 1 != 0;}, msg: ` Please deposit a real amount of gold.`}
    ],
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

        try {
            await profileModel.findOneAndUpdate(
                { userID: interaction.user.id },
                { $inc: { gold: -amount, bank: amount } }
            );
        } catch (error) {
            return interaction.reply({ content: 'Uh oh! Something went wrong while depositing your gold!', ephemeral:true });
        }

        await interaction.reply({ embeds: [embed] });
    }
}