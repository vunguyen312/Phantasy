const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { BattlePVE } = require('../../battle_system/battleInteract');
const { EmbedRow, waitForResponse, checkResponse } = require('../../utilities/embedUtils');

module.exports = {
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('dummy')
        .setDescription(`Spawn a combat dummy.`),
    syntax: '/dummy',
    conditions: ["0005"],
    async execute(interaction, profileData){
        
        const battle = new BattlePVE(interaction, interaction.user.tag, "Blue Slime", profileData.battleStats);
        battle.startBattle();
    }
}