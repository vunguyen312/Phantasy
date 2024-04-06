const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const profileModel = require('../../models/profileSchema');
const { modifyValue } = require('../../utilities/dbQuery');
const { getObjectData } = require('../../utilities/dbQuery');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription(`Give away some items.`)
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
    syntax: '/give <item> <user>',
    conditions: ["0005", "0001", "0006", "0003"],
    async execute(interaction, profileData, clanData, itemsList){

        const itemToGive = interaction.options.getString('item');
        const targetData = await profileModel.findOne({ userID: interaction.options.getUser('user').id });
        
        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`💰 ${interaction.user.tag} has received *${itemToGive.toUpperCase()}*!`)
        .setThumbnail(interaction.user.displayAvatarURL());

        await modifyValue(
            "profile",
            { userID: targetData.userID },
            { $set: { [`inventory.${itemToGive}`]: itemsList[itemToGive] } }
        );

        await modifyValue(
            "profile",
            { userID: targetData.userID },
            { $inc: { [`inventory.${itemToGive}.amount`]: 1 } }
        );        

        await interaction.reply({ embeds: [embed] });
    }
}