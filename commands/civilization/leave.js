const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const clanModel = require('../../models/clanSchema');
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 43200,
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave a civilization!')
        .setDMPermission(false),
    async execute(interaction, profileData){

        const clanData = await clanModel.findOne({ clanName: profileData.allegiance });

        //Checks so the game doesn't break

        if(!profileData.allegiance){
            return interaction.reply({ content: `Hm... It appears you're not in a civilization.`, ephemeral: true});
        }
        else if(!clanData){
            return interaction.reply({ content: `Could not retrieve your clan information. `, ephemeral: true });
        }
        else if(clanData.leaderID === interaction.user.id){
            return interaction.reply({ content: 'The leader of the civilization cannot leave. You must do /disband to disintegrate the civilization.', ephemeral: true});
        }

        //Create the embed

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