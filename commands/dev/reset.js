const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const profileModel = require("../../models/profileSchema");
const { getObjectData } = require('../../utilities/dbQuery');
const { modifyValue } = require('../../utilities/dbQuery');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription(`Reset the command user's profile.`),
    syntax: '/reset',
    conditions: ["0005"],
    async execute(interaction, profileData, clanData){
        
        const playerStats = {
            userID: interaction.user.id,
            rank: 'Lord',
            gold: 0,
            bank: 0,
            productionScore: 1,
            citizens: 1,
            growthRate: 1,
            earnRate: 10,
            taxRate: .1,
            jobs: new Map(),
            structures: new Map(),
            notifications: true,
            oath: 'Wanderer',
            inventory: new Map()
        }
        
        if(clanData) await modifyValue(
            "clan",
            { clanName: clanData.clanName },
            { $unset: { [`members.${profileData.rank}.${interaction.user.id}`]: "" } }
        );
        

        try{

            await profileModel.findOneAndDelete({ userID: interaction.user.id });

            const profile = await profileModel.create(playerStats);
            profile.save();

        } catch(error) {
            console.log(error);
        }

        await interaction.reply('Stats reset');
    }
}