const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const clanModel = require('../../models/clanSchema');
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite someone to join a civilization!')
        .addUserOption(option =>
            option
            .setName('user')
            .setDescription('The user to invite.')
            .setRequired(true))
        .setDMPermission(false),
    async execute(interaction, profileData){
        const clanData = await clanModel.findOne({ [`members.${interaction.user.id}`]: { $exists : true } });
        const targetData = await profileModel.findOne({ userID: interaction.options.getUser('user').id });

        //Checks so the game doesn't break

        if(!profileData.allegiance){
            return interaction.reply({ content: `Hm... It appears you're not in a civilization.`, ephemeral: true});
        }
        else if(!clanData){
            return interaction.reply({ content: 'Error while requesting clan data.', ephemeral: true });
        }
        else if(interaction.options.getUser('user').bot === true){
            return interaction.reply({ concent: `You can't invite bots to civilizations!`, ephemeral: true });
        }
        else if(!targetData){
            return interaction.reply({ content: `User isn't logged in the database. Get them to run any command.`, ephemeral:true });
        }

        //Create the embed

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`🛡️ ${interaction.user.tag} has invited ${interaction.options.getUser('user').username} to join ${clanData.clanName}!`);

        //Check which button user pressed

        const accept = new ButtonBuilder()
			.setCustomId('accept')
			.setLabel('Accept ✔️')
			.setStyle(ButtonStyle.Success);

		const decline = new ButtonBuilder()
			.setCustomId('decline')
			.setLabel('Decline ❌')
			.setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(decline, accept);
    

        const response = await interaction.reply({ 
            embeds: [embed],
            components: [row]
        });

        //Filter out anybody that's not our invite's recipient

        const userFilter = i => i.user.id === interaction.options.getUser('user').id;

        try {

            //Set a timer for the user to accept the invite

            const confirm = await response.awaitMessageComponent({ filter: userFilter, time: 60_000 });

            //Check if the user accepted or declined

            if (confirm.customId === 'accept') {

            //Updates the database

                try{
                    await profileModel.findOneAndUpdate(
                        {
                            userID: interaction.options.getUser('user').id,
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
                                [`members.${interaction.options.getUser('user').id}`]: 'Baron'
                            }
                        }
                    );
                } catch (error) {
                    console.log(error);
                    return interaction.reply({ content: 'Uh oh! Something went wrong while joining this civilization!', ephemeral:true });
                }

                embed
                .setTitle(`✔️ Welcome to ${clanData.clanName}`)
                .setFields({ name: '💎 Rank:', value: '*Baron*'})
                .setThumbnail(interaction.user.displayAvatarURL());
                await confirm.update({ embeds: [embed], components: [] });

            } else if (confirm.customId === 'decline') {

                embed.setTitle('❌ Invite has been declined.');
                await confirm.update({ embeds: [embed], components: [] });

            }
        } catch (e) {
            embed.setTitle('❌ Invite has expired.');
            await interaction.editReply({ embeds: [embed], components: [] });
        }
    }
}