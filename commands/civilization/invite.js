const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const clanModel = require('../../models/clanSchema');
const profileModel = require('../../models/profileSchema');
const { createConfirmation, waitForResponse, checkResponse, updateDeclined } = require("../../utilities/embedUtils");
const { modifyValue } = require('../../utilities/dbQuery');

const updateAccepted = async (interaction, targetData, profileData, clanData, embed, confirm) => {

    await modifyValue(
        { userID: interaction.options.getUser('user').id },
        { allegiance: clanData.clanName, rank: 'Baron' }
    );
    await clanModel.findOneAndUpdate(
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
    conditions: [
        {check: (interaction) => interaction.options.getUser('user').bot, msg: `You can't invite bots to civilizations!`},
        {check: async (interaction) => !await profileModel.findOne({ userID: interaction.options.getUser('user').id }), msg: `User isn't logged in the database. Get them to run any command.`},
        {check: (interaction, profileData) => !profileData.allegiance, msg: `Hm... It appears you're not in a civilization.`},
        {check: async (interaction) => await profileModel.findOne({ userID: interaction.options.getUser('user').id }).allegiance, msg: `The user you're trying to invite is already in a civilization.`},
    ],
    async execute(interaction, profileData, clanData){

        const targetData = await profileModel.findOne({ userID: interaction.options.getUser('user').id });

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`🛡️ ${interaction.user.tag} has invited ${interaction.options.getUser('user').username} to join ${clanData.clanName}!`);

        const row = createConfirmation();

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