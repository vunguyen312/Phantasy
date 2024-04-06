const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { modifyValue } = require('../../utilities/dbQuery');

module.exports = {
    cooldown: 43200,
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave your current civilization.')
        .setDMPermission(false),
    syntax: '/leave',
    conditions: ["0008", "0007", "0016"],
    async execute(interaction, profileData, clanData){

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${interaction.user.tag} has left ${clanData.clanName}!`)
        .setThumbnail(interaction.user.displayAvatarURL());

        //Update the database    

        await modifyValue(
            "profile",
            { userID: interaction.user.id },
            { allegiance: null, rank: 'Lord' }
        );
        await modifyValue(
            "clan",
            { serverID: interaction.options.getString('id') ?? interaction.guild.id },
            { $unset: { [`members.${interaction.user.id}`]: profileData.rank } }
        );

        await interaction.reply({ embeds: [embed] });
    }
}