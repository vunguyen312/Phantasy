const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const clanModel = require('../../models/clanSchema');
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('disband')
        .setDescription('Disband a civilization.')
        .setDMPermission(false),
    async execute(interaction, profileData){

        const clanData = await clanModel.findOne({ clanName: profileData.allegiance });

        //Checks so the game doesn't break

        if(!profileData.allegiance){
            return interaction.reply({ content: `You're not in a civilization.`, ephemeral: true});
        }
        else if(!clanData.leaderID == interaction.user.id){
            return interaction.reply({ content: `You're not the leader of this civilization.`, ephemeral:true });
        }

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${interaction.user.tag} has disbanded ${interaction.options.getString('name')}!`)
        .setThumbnail(interaction.user.displayAvatarURL());

        try{

            await profileModel.updateMany(
                {
                    allegiance: clanData.clanName
                },
                {
                    $set: {
                        allegiance: null,
                        rank: 'Lord'
                    }
                }
            );

            await clanData.deleteOne(
                {
                    clanName: profileData.allegiance
                }
            );

        }catch(error){
            return interaction.reply({ content: `Uh oh! Something went wrong while disbanding your civilization.`, ephemeral: true }), console.log(error);
        }

        await interaction.reply({ embeds: [embed] });
    }
}