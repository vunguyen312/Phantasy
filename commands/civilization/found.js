const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const clanModel = require('../../models/clanSchema');
const { modifyValue } = require('../../utilities/dbQuery');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('found')
        .setDescription('Found a civilization in the current server the command is run in.')
        .addStringOption(option =>
            option
            .setName('name')
            .setDescription('The name of your new civilization.')
            .setRequired(true))
        .addBooleanOption(option =>
            option
            .setName('public')
            .setDescription('Will your Civilization be private or public? (Invite required or not)')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    syntax: '/found <name> <public>',
    conditions: [
        {check: (interaction, profileData) => profileData.allegiance, msg: `Hm... It appears you're already in a civilization.`},
        {check: (interaction) => interaction.options.getString('name').length > 20, msg: `Max Character Limit: 20`},
        {check: (interaction) => !/^[a-zA-Z]+$/.test(interaction.options.getString('name')), msg: `Non-alphabetical characters cannot be used in your civilization name.`},
        {check: async (interaction) => await clanModel.findOne({ clanName: interaction.options.getString('name') }), msg: `A civilization with this name already exists!`},
        {check: async (interaction) => await clanModel.findOne({ serverID: interaction.guild.id }), msg: `A civilization has already been founded in this server!`},
    ],
    async execute(interaction, profileData){

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${interaction.user.tag} has founded ${interaction.options.getString('name')}!`)
        .setFields(
            { name: '🚩 Founder:', value: `<@${interaction.user.id}>`},
        )
        .setThumbnail(interaction.user.displayAvatarURL());

        const clanData = {
            clanName: interaction.options.getString('name'),
            leaderID: interaction.user.id,
            serverID: interaction.guild.id,
            public: interaction.options.getBoolean('public'),
            members: {
                King: new Map([[interaction.user.id, interaction.user.id]]),
                Duke: new Map(),
                Baron: new Map()
            },

            //Inventory

            inventory: new Map()
        }

        try{
            
            const clan = await clanModel.create(clanData);
            clan.save();

        }catch(error){
            return interaction.reply(`Uh oh! Something went wrong while setting up your Clan!`), console.log(error);
        }

        await modifyValue(
            "profile",
            { userID: interaction.user.id },
            { allegiance: interaction.options.getString('name'), rank: 'King' }
        );

        await interaction.reply({ embeds: [embed] });
    }
}