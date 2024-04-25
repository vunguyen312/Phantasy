const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { BattleNPC } = require('../../utilities/battleInteract');
const { EmbedRow, waitForResponse, checkResponse } = require('../../utilities/embedUtils');

module.exports = {
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('dummy')
        .setDescription(`Spawn a combat dummy.`),
    syntax: '/dummy',
    conditions: ["0005"],
    async execute(interaction, profileData){
        
        const battle = new BattleNPC(interaction, interaction.user.id, "Dummy", profileData.battleStats, { health: 20 });
        const embed = battle.createEmbed(interaction);

    }
}