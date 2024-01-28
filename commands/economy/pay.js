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
    conditions: [
        {check: (interaction) => interaction.options.getUser('user').bot, msg: `You can't pay bots!`},
        {check: (interaction) => {const amount = interaction.options.getNumber('amount'); return amount <= 0 || amount > profileData.gold || amount % 1 != 0;}, msg: `Please enter a real amount of gold.`},
        {check: async (interaction) => !(await profileModel.findOne({ userID: interaction.options.getUser('user').id })), msg: `User isn't logged in the database. Get them to run any command.`}
    ],
    async execute(interaction, profileData){

        const amount = interaction.options.getNumber('amount');
        const targetData = await profileModel.findOne({ userID: interaction.options.getUser('user').id });

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
            );
        } catch (error) {
            return interaction.reply({ content: 'Uh oh! Something went wrong!', ephemeral:true});
        }

        

        await interaction.reply({ embeds: [embed] });
    }
}