const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { showLevel } = require('../../utilities/embedUtils');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription(`Get the stats of your profile or your civilization.`),
    syntax: '/stats',
    conditions: [],
    async execute(interaction, profileData, clanData){
        
        const embedSpace = { name: '\u200B', value: '\u200B', inline: true };
        const userLevel = await showLevel(profileData.exp, profileData.exp, interaction);
        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`📈 ${interaction.user.tag}'s Stats`)
        .setDescription(`\n${userLevel}\n`)
        .setFields(
            { name: '🚩 Allegiance:', value: `\`${ profileData.allegiance ?? 'None' }\``, inline: true },
            embedSpace,
            { name: '🥇 Rank:', value: `\`${ profileData.rank }\``, inline: true },
            { name: '🧈 Gold:', value: `\`${ profileData.gold }\``, inline: true },
            embedSpace,
            { name: '💰 Bank:', value: `\`${ profileData.bank }\``, inline: true },
            { name: '🧑‍🤝‍🧑 Citizens:', value: `\`${ profileData.citizens }\``, inline: true },
            embedSpace,
            { name: '📈 Growth Rate:', value: `\`${ profileData.growthRate } citizens/h\``, inline: true },
            { name: '🏆 Gold Rate:', value: `\`${ profileData.earnRate } gold/h\``, inline: true },
            embedSpace,
            { name: '💸 Tax Rate:', value: `\`${ profileData.taxRate * 100 }%\``, inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL());


        /*    embed
            .setColor('Blue')
            .setTitle(`📈 ${profileData.allegiance}'s Stats`)
            .setDescription(`The stats of ${profileData.allegiance}`)
            .setFields(
                { name: '👑 Leader', value: `<@${ clanData.leaderID }>` },
                { name: '🛡️ Members:', value: `${ clanData.members.size }` },
                { name: '🧑‍🤝‍🧑 Citizens:', value: `placeholder`},
                { name: '🌎 Server:', value: `${ clanData.serverID }` }
            )
        } else {
            return interaction.reply({ content: `Missing fields or not apart of any civilization.`, ephemeral: true});
        }*/

        await interaction.reply({ embeds: [embed] });
    }
}