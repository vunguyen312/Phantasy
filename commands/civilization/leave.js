const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const clanModel = require('../../models/clanSchema');
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 43200,
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave a civilization!')
        .setDMPermission(false),
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

        try{
            await profileModel.findOneAndUpdate(
                {
                    userID: interaction.user.id,
                },
                {
                    allegiance: null,
                    rank: 'Lord'
                }
            );
            await clanModel.findOneAndUpdate(
                {
                    serverID: interaction.options.getString('id') ?? interaction.guild.id,
                },
                {
                    $unset: {
                        [`members.${interaction.user.id}`]: profileData.rank
                    }
                }
            );
        } catch (error) {
            console.log(error);
            return interaction.reply({ content: 'Uh oh! Something went wrong while leaving this civilization!', ephemeral:true });
        }

        await interaction.reply({ embeds: [embed] });
    }
}