const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const clanModel = require('../../models/clanSchema');
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 120,
    data: new SlashCommandBuilder()
        .setName('disband')
        .setDescription('Disband a civilization.')
        .setDMPermission(false),
    conditions: [
        {check: (interaction, profileData) => !profileData.allegiance, msg: `You're not in a civilization.` },
        {check: (interaction, profileData, clanData) => clanData.leaderID !== interaction.user.id, msg: `You're not the leader of this civilization.` },
    ],
    async execute(interaction, profileData, clanData){

        const clanName = clanData.clanName;

        //Checks so the game doesn't break

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`Are you sure you want to disband your civilization? Doing so is irreversible.`)
        .setThumbnail(interaction.user.displayAvatarURL());

        const accept = new ButtonBuilder()
			.setCustomId('accept')
			.setLabel('Confirm ✔️')
			.setStyle(ButtonStyle.Success);

		const decline = new ButtonBuilder()
			.setCustomId('decline')
			.setLabel('Cancel ❌')
			.setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(decline, accept);

        const response = await interaction.reply({ 
            embeds: [embed],
            components: [row]
        });

        const userFilter = i => i.user.id === interaction.user.id

        try{

            const confirm = await response.awaitMessageComponent({ filter: userFilter, time: 60_000 });

            if (confirm.customId === 'accept') {
                
            await profileModel.updateMany(
                { allegiance: clanData.clanName },
                { $set: { allegiance: null, rank: 'Lord' } }
            );

            await clanData.deleteOne(
                { clanName: profileData.allegiance }
            );

            embed
            .setTitle(`✔️ ${interaction.user.tag} has disbanded ${clanName}!`);
            await confirm.update({ embeds: [embed], components: [] });

            } else if (confirm.customId === 'decline') {

                embed.setTitle('❌ Deletion cancelled.');
                await confirm.update({ embeds: [embed], components: [] });

            }
        } catch (error) {
            console.log(error);
            embed.setTitle('❌ Window has expired.');
            return await interaction.editReply({ embeds: [embed], components: [] });
        }


    }
}