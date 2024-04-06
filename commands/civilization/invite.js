const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const profileModel = require('../../models/profileSchema');
const { EmbedRow, waitForResponse, checkResponse, updateDeclined } = require("../../utilities/embedUtils");
const { modifyValue } = require('../../utilities/dbQuery');

const updateAccepted = async (interaction, targetData, profileData, clanData, embed, confirm) => {

    await modifyValue(
        "profile",
        { userID: interaction.options.getUser('user').id },
        { allegiance: clanData.clanName, rank: 'Baron' }
    );
    await modifyValue(
        "clan",
        { clanName: profileData.allegiance },
        { $set: { [`members.Baron.${targetData.userID}`]: targetData.userID } }
    );

    embed
    .setTitle(`✔️ Welcome to ${clanData.clanName}`)
    .setFields({ name: '💎 Rank:', value: '*Baron*'})
    .setThumbnail(interaction.options.getUser('user').displayAvatarURL());
    await confirm.update({ embeds: [embed], components: [] });
}

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite someone to join your current civilization.')
        .addUserOption(option =>
            option
            .setName('user')
            .setDescription('The user to invite.')
            .setRequired(true))
        .setDMPermission(false),
    syntax: '/invite <user>',
    conditions: ["0001", "0003", "0008", "0011"],
    async execute(interaction, profileData, clanData){

        const targetData = await profileModel.findOne({ userID: interaction.options.getUser('user').id });

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`🛡️ ${interaction.user.tag} has invited ${interaction.options.getUser('user').username} to join ${clanData.clanName}!`);

        const embedRow = new EmbedRow();

        const row = embedRow.createConfirmation();

        const response = await interaction.reply({ 
            embeds: [embed],
            components: [row]
        });

        const confirm = await waitForResponse(interaction, response, "targetUser");

        const actions = {
            "accept": updateAccepted.bind(null, interaction, targetData, profileData, clanData, embed, confirm),
            "decline": updateDeclined.bind(null, confirm)
        }

        await checkResponse(response, actions, confirm);
    }
}