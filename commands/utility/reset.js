const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset user profile'),
    condition: [],
    async execute(interaction){
        //Command isn't registering on discord for some reason? 
        await interaction.reply('test');
    }
}