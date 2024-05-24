const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { EmbedRow, showLevel, waitForResponse, checkResponse } = require('../../utilities/embedUtils');

const getStats = (profileData, clanData, type) => {

    const embedSpace = { name: '\u200B', value: '\u200B', inline: true };

    const formatTable = {
        "personal": [
            { name: '🚩 Allegiance:', value: `\`${ profileData.allegiance ?? 'None' }\``, inline: true },
            embedSpace,
            { name: '🥇 Rank:', value: `\`${ profileData.rank }\``, inline: true },
            { name: '🧈 Gold:', value: `\`${ profileData.gold }\``, inline: true },
            embedSpace,
            { name: '💰 Bank:', value: `\`${ profileData.bank } / ${ profileData.maxBank }\``, inline: true }
        ],
        "clan": [
            { name: '👑 Leader:', value: `\`<@${ clanData ? clanData.leaderID : "None" }>\``, inline: true },
            embedSpace,
            { name: '🛡️ Members:', value: `\`${ clanData ? clanData.members.size : 0 }\``, inline: true },
            { name: '🧑‍🤝‍🧑 Citizens:', value: `\`${ clanData ? clanData.citizens : 0 }\``, inline: true},
            embedSpace,
            { name: '🏆 Gold Rate:', value: `\`${ clanData ? clanData.earnRate : 0 } gold/h\``, inline: true },
            { name: '🌎 Server:', value: `\`${ clanData ? clanData.serverID : "None" }\``, inline: true }
        ],
        "battle": [
            { name: '❤️ Health:', value: `\`${ profileData.battleStats.health } HP\``, inline: true },
            { name: '💧 Ichor:', value: `\`${ profileData.battleStats.ichor } Ichor\``, inline: true },
            { name: '🛡️ Defense:', value: `\`${ profileData.battleStats.defense } DEF\``, inline: true},
            { name: '🤺 Physical Attack:', value: `\`${ profileData.battleStats.physAtk } ATK\``, inline: true },
            { name: '🔮 Ichor Attack:', value: `\`${ profileData.battleStats.ichorAtk } ATK\``, inline: true},
            { name: '🏰 Physical Resistance:', value: `\`${ profileData.battleStats.physRes } RES\``, inline: true },
            { name: '💙 Ichor Resistance:', value: `\`${ profileData.battleStats.ichorRes } RES\``, inline: true},
            { name: '💨 Speed:', value: `\`${ profileData.battleStats.speed } SPD\``, inline: true },
            { name: '📿 Willpower:', value: `\`${ profileData.battleStats.willpower } WP\``, inline: true }
        ],
    };

    return formatTable[type];
}

const swapPage = async (interaction, profileData, clanData, response, confirm, row, embed, type, buttons) => {

    const userLevel = await showLevel(profileData.exp, profileData.exp, interaction);

    embed
    .setColor('Blue')
    .setTitle(`📈 ${interaction.user.tag}'s Stats`)
    .setDescription(`\n${userLevel}\n`)
    .setFields(getStats(profileData, clanData, type))
    .setThumbnail(interaction.user.displayAvatarURL());

    row.components[buttons[0]].setDisabled(false);
    row.components[buttons[1]].setDisabled(true);

    await confirm.update({ embeds: [embed], components: [row] });

    const confirm2 = await waitForResponse(interaction, response, "user");

    const actions = {
        "personalStats": await swapPage.bind(null, interaction, profileData, clanData, response, confirm2, row, embed, "personal", [buttons[1], 0]),
        "clanStats": await swapPage.bind(null, interaction, profileData, clanData, response, confirm2, row, embed, "clan", [buttons[1], 1]),
        "battleStats": await swapPage.bind(null, interaction, profileData, clanData, response, confirm2, row, embed, "battle", [buttons[1], 2])
    };

    await checkResponse(response, actions, confirm2, "button");
}

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription(`Get the stats of your profile or your civilization.`),
    syntax: '/stats',
    conditions: [],
    async execute(interaction, profileData, clanData){

        const userLevel = await showLevel(profileData.exp, profileData.exp, interaction);
    
        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`📈 ${interaction.user.tag}'s Stats`)
        .setDescription(`\n${userLevel}\n`)
        .setFields(getStats(profileData, clanData, "personal"))
        .setThumbnail(interaction.user.displayAvatarURL());
    
        const embedRow = new EmbedRow();
    
        const personalStats = embedRow.createButton("personalStats", "🏆", ButtonStyle.Secondary);
        const clanStats = embedRow.createButton("clanStats", "🛡️", ButtonStyle.Secondary);
        const battleStats = embedRow.createButton("battleStats", "⚔️", ButtonStyle.Secondary);
    
        const row = new ActionRowBuilder().setComponents(personalStats, clanStats, battleStats);

        row.components[0].setDisabled(true);
    
        const response = await interaction.reply({ embeds: [embed], components: [row] });
    
        const confirm = await waitForResponse(interaction, response, "user");
    
        const actions = {
            "personalStats": await swapPage.bind(null, interaction, profileData, clanData, response, confirm, row, embed, "personal"),
            "clanStats": await swapPage.bind(null, interaction, profileData, clanData, response, confirm, row, embed, "clan", [0, 1]),
            "battleStats": await swapPage.bind(null, interaction, profileData, clanData, response, confirm, row, embed, "battle", [0, 2])
        };
    
        await checkResponse(response, actions, confirm, "button");
    }
}