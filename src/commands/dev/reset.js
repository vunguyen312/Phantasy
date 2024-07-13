const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../../models/profileSchema");
const itemModel = require("../../models/itemSchema");
const { modifyValue, createNewPlayer } = require('../../utilities/dbQuery');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription(`Reset the command user's profile.`),
    syntax: '/reset',
    conditions: ["0005"],
    async execute(interaction, profileData, clanData){

        if(clanData) await modifyValue(
            "clan",
            { clanName: clanData.clanName },
            { $unset: { [`members.${profileData.rank}.${interaction.user.id}`]: "" } }
        );

        //Wipe the database of the user's data
        await profileModel.findOneAndDelete({ userID: interaction.user.id });
        await itemModel.deleteMany({ userID: interaction.user.id });
        await createNewPlayer(interaction);

        await interaction.reply('Stats reset');
    }
}