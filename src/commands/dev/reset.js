const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const profileModel = require("../../models/profileSchema");
const { modifyValue } = require('../../utilities/dbQuery');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription(`Reset the command user's profile.`),
    syntax: '/reset',
    conditions: ["0005"],
    async execute(interaction, profileData, clanData){

        const battleStats = {
            health: 100,
            ichor: 100,
            defense: 10,
            speed: 50,
            physRes: 0,
            ichorRes: 0,
            physAtk: 10,
            ichorAtk: 10,
            willpower: 5
        };
        
        const playerStats = {
            userID: interaction.user.id,
            exp: 0,
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
            inventory: new Map(),
            battleStats: battleStats
        };
        
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