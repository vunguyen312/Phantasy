const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const clanModel = require('../../models/clanSchema');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription(`Get the stats of your profile or your civilization's!`)
        .addStringOption(option =>
            option
            .setName('profile')
            .setDescription('Add civ for Civilization Stats or leave blank for Personal Stats.')),
    conditions: [
        {check: (interaction, profileData) => !profileData.allegiance && interaction.options.getString('profile') === 'civ', msg: `You need to be a civilization to check civilization stats!`}
    ],
    async execute(interaction, profileData, clanData){
        const embed = new EmbedBuilder()

        const embedSpace = { name: '\u200B', value: '\u200B', inline: true };

        if(!interaction.options.getString('profile')){
            embed
            .setColor('Blue')
            .setTitle(`📈 ${interaction.user.tag}'s Stats`)
            .setDescription(`Personal Stat Page of ${interaction.user.tag}`)
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
                { name: '💸 Tax Rate:', value: `\`${ profileData.taxRate * 100 }%\``, inline: true },
            )
            .setThumbnail(interaction.user.displayAvatarURL());
        } else if(interaction.options.getString('profile') === 'civ'){
            embed
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
        }

        await interaction.reply({ embeds: [embed] });
    }
}