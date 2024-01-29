const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription(`Give away some items!`)
        .addStringOption(option =>
            option
            .setName('item')
            .setDescription('The item to give.')
            .setRequired(true))
        .addUserOption(option =>
            option
            .setName('user')
            .setDescription('The user to give the item to.')
            .setRequired(true)),
    conditions: [
        {check: (interaction) => interaction.options.getUser('user').bot, msg: `You can't give items to bots!`},
        {check: (interaction) => !itemsList[interaction.options.getString('item')], msg: `Please enter a valid item.`},
        {check: async (interaction) => !(await profileModel.findOne({ userID: interaction.options.getUser('user').id })), msg: `User isn't logged in the database. Get them to run any command.`}
    ],
    async execute(interaction, profileData, itemsList){

        const itemToGive = interaction.options.getString('item');
        const targetData = await profileModel.findOne({ userID: interaction.options.getUser('user').id });
        
        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`💰 ${interaction.user.tag} has received *${itemToGive.toUpperCase()}*!`)
        .setThumbnail(interaction.user.displayAvatarURL());

        try {
            profileModel.findOneAndUpdate(
                { userID: targetData.userID },
                { $set: { [`inventory.${itemToGive}`]: itemsList[itemToGive] } }
            );
            await profileModel.findOneAndUpdate(
                { userID: targetData.userID },
                { $inc: { [`inventory.${itemToGive}.amount`]: 1 } }
            );
        } catch (error) {
            return interaction.reply({ content: 'Uh oh! Something went wrong!', ephemeral:true});
        }

        

        await interaction.reply({ embeds: [embed] });
    }
}