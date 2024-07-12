const { SlashCommandBuilder } = require("discord.js");
const { BattlePVE } = require('../../battle_system/battleInteract');

module.exports = {
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('dummy')
        .setDescription(`Spawn a combat dummy.`)
        .addStringOption(option =>
            option
            .setName("monster")
            .setDescription("Monster to use as a dummy")
            .setRequired(true)),
    syntax: '/dummy',
    conditions: ["0005"],
    async execute(interaction, profileData){

        const { battleStats, activeSpells } = profileData;
        const monster = interaction.options.getString('monster');
        new BattlePVE(interaction, interaction.user.tag, monster, battleStats, activeSpells);

        await interaction.reply("`A hostile enemy has appeared...`");
    }
}