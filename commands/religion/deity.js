const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { createConfirmation, modifyValue, fileMap } = require('../../utilities/utilities');

module.exports = {
    cooldown: 20,
    data: new SlashCommandBuilder()
        .setName('deity')
        .setDescription(`Found a deity for your people to worship!`),
    conditions: [
        {check: (interaction, profileData) => profileData.gold < 10000, msg: `You need 🧈 10,000 gold to found a deity!`}
    ],
    async execute(interaction, profileData){
        const embed = new EmbedBuilder()
        .setColor("White")
        .setTitle(`A Challenger Approaches The Tower...`)
        .setDescription("`Dost thou wish to proceed?`")
        .setImage("https://cdn.discordapp.com/attachments/769659795740688424/1210771403108777985/image.png?ex=65ebc5bd&is=65d950bd&hm=287e92f051136266113aa8df6ba3c9827f05b4427db95f6a0e0aab8686569663&");

        const row = createConfirmation();

        const response = await interaction.reply({ 
            embeds: [embed],
            components: [row]
        });

    }
}