const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription(`Withdraw your coins from the bank!`)
        .addNumberOption(option =>
            option
            .setName('amount')
            .setDescription('The amount of coins to withdraw.')
            .setRequired(true)),
    async execute(interaction, profileData){
        
        const amount = interaction.options.getNumber('amount');

        if(amount <= 0 || amount > profileData.bank || amount % 1 != 0){
            return interaction.reply({ content: 'Please withdraw a real amount of gold.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`💰 ${interaction.user.tag} has withdrawn gold`)
        .setFields(
            { name: '🧈 Gold Withdrawn:', value: `${ amount }`},
            { name: '🏦 New Balance:', value: `${ profileData.bank - amount }`}
        )
        .setThumbnail(interaction.user.displayAvatarURL());

        try {
            await profileModel.findOneAndUpdate(
                {
                    userID: interaction.user.id
                },
                {
                    $inc: {
                        gold: amount,
                        bank: -amount
                    }
                }
            );
        } catch ( error ) {
            return interaction.reply({ content: 'Uh oh! Something went wrong while withdrawing your gold!', ephemeral:true});
        }

        

        await interaction.reply({ embeds: [embed] });
    }
}