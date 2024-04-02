const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { modifyValue } = require('../../utilities/dbQuery');

module.exports = {
    cooldown: 43200,
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave your current civilization.')
        .setDMPermission(false),
    syntax: '/leave',
    conditions: [
        {check: (interaction, profileData) => !profileData.allegiance, msg: `Hm... It appears you're not in a civilization.`},
        {check: (interaction, profileData, clanData) => !clanData, msg: `Could not retrieve your clan information.`},
        {check: (interaction, profileData, clanData) => clanData.leaderID === interaction.user.id, msg: `The leader of the civilization cannot leave. You must do /disband to disintegrate the civilization.`},
    ],
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