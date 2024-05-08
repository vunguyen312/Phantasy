const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const profileModel = require('../../models/profileSchema');
const { createConfirmation, componentResponse, updateDeclined } = require("../../utilities/embedUtils");

const updateAccepted = async (interaction, profileData, clanData, embed, confirm) => {
    const clan = clanData.clanName;

    await profileModel.updateMany(
        { allegiance: clan },
        { $set: { allegiance: null, rank: 'Lord' } }
    );

    await clanData.deleteOne(
        { clanName: clan}
    );

    embed
    .setTitle(`✔️ ${interaction.user.tag} has disbanded ${clan}!`);
    await confirm.update({ embeds: [embed], components: [] });
}

module.exports = {
    cooldown: 120,
    data: new SlashCommandBuilder()
        .setName('disband')
        .setDescription(`Disband the current civilization you're in if you're the leader.`)
        .setDMPermission(false),
    syntax: '/disband',
    conditions: ["0008", "0010"],
    async execute(interaction, profileData, clanData){

        const clanName = clanData.clanName;

        //Checks so the game doesn't break

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`Are you sure you want to disband your civilization? Doing so is irreversible.`)
        .setThumbnail(interaction.user.displayAvatarURL());

        const row = createConfirmation();

        const response = await interaction.reply({ 
            embeds: [embed],
            components: [row]
        });

        const actions = {
            "accept": updateAccepted.bind(null, interaction, profileData, clanData, embed, confirm),
            "decline": updateDeclined.bind(null, confirm)
        }

        await componentResponse(interaction, response, actions, "user", "button");
    }
}