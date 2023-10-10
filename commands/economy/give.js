const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription(`Give away some items!`)
        .addStringOption(option =>
            option
            .setName('item')
            .setDescription('The item to give.')
            .setRequired(true))
        .addUserOption(option =>
            option
            .setName('user')
            .setDescription('The user to give the item to.')
            .setRequired(true)),
    async execute(interaction, profileData, itemsList){

        if(interaction.options.getUser('user').bot === true){
            return interaction.reply({ content: `You can't give items to bots!`, ephemeral: true });
        }

        const itemToGive = interaction.options.getString('item');
        const targetData = await profileModel.findOne({ userID: interaction.options.getUser('user').id });
        
        if(!itemsList[itemToGive]){
            return interaction.reply({ content: 'Please enter a valid item.', ephemeral: true});
        }
        else if(!targetData){
            return interaction.reply({ content: `User isn't logged in the database. Get them to run any command.`, ephemeral:true });
        }
        

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`💰 ${interaction.user.tag} has received *${itemToGive.toUpperCase()}*!`)
        .setThumbnail(interaction.user.displayAvatarURL());

        try {
            profileModel.findOneAndUpdate(
                {
                    userID: targetData.userID
                },
                {
                    $set: {
                        [`inventory.${itemToGive}`]: itemsList[itemToGive]
                    }
                }
            );
            await profileModel.findOneAndUpdate(
                {
                    userID: targetData.userID
                },
                {
                    $inc: {
                        [`inventory.${itemToGive}.amount`]: 1
                    }
                }
            );
        } catch (error) {
            return interaction.reply({ content: 'Uh oh! Something went wrong!', ephemeral:true});
        }

        

        await interaction.reply({ embeds: [embed] });
    }
}