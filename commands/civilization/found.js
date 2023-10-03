const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const clanModel = require('../../models/clanSchema');
const profileModel = require('../../models/profileSchema');
const profanityFilter = import('@coffeeandfun/google-profanity-words');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('found')
        .setDescription('Found your civilization! (Creates a civilization for the server)')
        .addStringOption(option =>
            option
            .setName('name')
            .setDescription('The name of your new civilization!')
            .setRequired(true))
        .addBooleanOption(option =>
            option
            .setName('public')
            .setDescription('Will your Civilization be private or public? (Invite required or not)')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction, profileData){

        //Check for non-alphabetical characters and profanity

        const regex = /^[a-zA-Z]+$/;

        const profanity = new (await profanityFilter).ProfanityEngine();

        //Checks so the game doesn't break

        if(profileData.allegiance){
            return interaction.reply({ content: `Hm... It appears you're already in a civilization.`, ephemeral: true});
        }
        else if(interaction.options.getString('name').length > 20){
            return interaction.reply({ content: `Max Character Limit: 20`, ephemeral:true });
        }
        else if(await profanity.search(interaction.options.getString('name'))){
            return interaction.reply({ content: 'Profanity detected in name.', ephemeral:true });
        }
        else if(!regex.test(interaction.options.getString('name'))){
            return interaction.reply({ content: 'Non-alphabetical characters cannot be used in your civilization name.', ephemeral:true });
        }
        else if(await clanModel.findOne({ clanName: interaction.options.getString('name') })){
            return interaction.reply({ content: 'A civilization with this name already exists!', ephemeral:true });
        }
        else if(await clanModel.findOne({ serverID: interaction.guild.id })){
            return interaction.reply({ content: 'A civilization has already been founded in this server!', ephemeral:true });
        }

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${interaction.user.tag} has founded ${interaction.options.getString('name')}!`)
        .setFields(
            { name: '🚩 Founder:', value: `<@${interaction.user.id}>`},
        )
        .setThumbnail(interaction.user.displayAvatarURL());

        try{
            
            const clan = await clanModel.create(
                {
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
            );
            clan.save();

            await profileModel.findOneAndUpdate(
                {
                    userID: interaction.user.id
                },
                {
                    allegiance: interaction.options.getString('name'),
                    rank: 'King'
                }
            );

        }catch(error){
            return interaction.reply(`Uh oh! Something went wrong while setting up your Clan!`), console.log(error);
        }

        await interaction.reply({ embeds: [embed] });
    }
}