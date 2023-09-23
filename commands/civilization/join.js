const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const clanModel = require('../../models/clanSchema');
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join a civilization!')
        .addStringOption(option =>
            option
            .setName('id')
            .setDescription('ID of the Server/Civilization'))
        .setDMPermission(false),
    async execute(interaction, profileData){
        const clanData = await clanModel.findOne({ serverID: interaction.options.getString('id') }) || await clanModel.findOne({ serverID: interaction.guild.id });

        //Checks so the game doesn't break

        if(profileData.allegiance){
            return interaction.reply({ content: `Hm... It appears you're already in a civilization.`, ephemeral: true});
        }
        else if(!clanData){
            return interaction.reply({ content: 'Invalid Civilization ID (Server ID)', ephemeral:true });
        }
        else if(clanData.public === false){
            return interaction.reply({ content: 'This civilization is private and invite only!'});
        }

        //Create the embed

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${interaction.user.tag} has joined ${clanData.clanName}!`)
        .setFields(
            { name: '💎 Rank:', value: '*Baron*'},
        )
        .setThumbnail(interaction.user.displayAvatarURL());

        //Update the database    

        try{
            await profileModel.findOneAndUpdate(
                {
                    userID: interaction.user.id,
                },
                {
                    allegiance: clanData.clanName,
                    rank: 'Baron'
                }
            );
            await clanModel.findOneAndUpdate(
                {
                    serverID: interaction.options.getString('id') ?? interaction.guild.id,
                },
                {
                    $set: {
                        [`members.${interaction.user.id}`]: 'Baron'
                    }
                }
            );
        } catch (error) {
            console.log(error);
            return interaction.reply({ content: 'Uh oh! Something went wrong while joining this civilization!', ephemeral:true });
        }

        await interaction.reply({ embeds: [embed] });
    }
}