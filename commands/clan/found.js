const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const clanModel = require('../../models/clanSchema');
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('found')
        .setDescription('Found your clan! (Creates a clan for the server)')
        .addStringOption(option =>
            option
            .setName('name')
            .setDescription('The name of your new Clan!')
            .setRequired(true))
        .addBooleanOption(option =>
            option
            .setName('public')
            .setDescription('Will your Clan be private or public? (Invite required or not)')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction, profileData){
        if(profileData.allegiance){
            return interaction.reply({ content: `Hm... It appears you're already in a clan.`, ephemeral: true});
        }

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${interaction.user.tag} has founded ${interaction.options.getString('name')}!`)
        .setFields(
            { name: '🚩 Founder:', value: `<@${interaction.user.id}>`},
        )
        .setThumbnail(interaction.user.displayAvatarURL());

        try{
            let clan = await clanModel.create(
                {
                    clanName: interaction.options.getString('name'),
                    leaderID: interaction.user.id,
                    serverID: interaction.guild.id,
                    public: interaction.options.getBoolean('public'),
                    members: new Map().set(interaction.user.id, 'Leader'),

                    //Resources

                    wood: 0,
                    stone: 0

                }
            );
            clan.save();

            const response2 = await profileModel.findOneAndUpdate(
                {
                    allegiance: interaction.options.getString('name')
                }
            );
        }catch(error){
            return interaction.reply(`Uh oh! Something went wrong while setting up your Clan!`), console.log(error);
        }

        await interaction.reply({ embeds: [embed] });
    }
}