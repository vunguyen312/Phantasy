const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Shows your stats'),
    async execute(interaction, profileData){
        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`📈 ${interaction.user.tag}'s Stats`)
        .setDescription(`The stats of user ${interaction.user.tag}`)
        .setFields(
            { name: '🚩 Allegiance:', value: `${profileData.allegiance ?? 'None'}`},
            { name: '🥇 Rank', value: `${profileData.rank}`},
            { name: '🧈 Gold:', value: `${profileData.gold}`},
            { name: '💰 Bank:', value: `${profileData.bank}`}
        )
        .setThumbnail(interaction.user.displayAvatarURL());

        await interaction.reply({ embeds: [embed] });
    }
}