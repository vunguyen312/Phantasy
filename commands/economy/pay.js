const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription(`Give away some gold!`)
        .addNumberOption(option =>
            option
            .setName('amount')
            .setDescription('The amount of coins to give.')
            .setRequired(true))
        .addUserOption(option =>
            option
            .setName('user')
            .setDescription('The user to invite.')
            .setRequired(true)),
    async execute(interaction, profileData){

        if(interaction.options.getUser('user').bot === true){
            return interaction.reply({ content: `You can't pay bots!`, ephemeral: true });
        }

        const amount = interaction.options.getNumber('amount');
        const targetData = await profileModel.findOne({ userID: interaction.options.getUser('user').id });
        
        if(amount <= 0 || amount > profileData.gold || amount % 1 != 0){
            return interaction.reply({ content: 'Please enter a real amount of gold.', ephemeral: true});
        }
        else if(!targetData){
            return interaction.reply({ content: `User isn't logged in the database. Get them to run any command.`, ephemeral:true });
        }
        

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`💰 ${interaction.user.tag} has paid ${interaction.options.getUser('user').username} ${amount} gold`)
        .setFields(
            { name: '🧈 Gold Paid:', value: `${amount}` },
            { name: '🏦 New Balance:', value: `${profileData.gold - amount}` }
        )
        .setThumbnail(interaction.user.displayAvatarURL());

        try {
            await profileModel.findOneAndUpdate(
                {
                    userID: interaction.user.id
                },
                {
                    $inc: {
                        gold: -amount,
                    }
                }
            );
            await profileModel.findOneAndUpdate(
                {
                    userID: interaction.options.getUser('user').id
                },
                {
                    $inc:{
                        gold: amount
                    }
                }
            )
        } catch (error) {
            return interaction.reply({ content: 'Uh oh! Something went wrong!', ephemeral:true});
        }

        

        await interaction.reply({ embeds: [embed] });
    }
}