const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");

class EmbedRow {

    constructor(embed){
        this.embed = embed;
    }

    createButton(id, label, style){

        return new ButtonBuilder()
        .setCustomId(id)
        .setLabel(label)
        .setStyle(style);
    }

    createConfirmation(){

        const accept = this.createButton('accept', 'Accept ✔️', ButtonStyle.Success);
        const decline = this.createButton('decline', 'Decline ❌', ButtonStyle.Danger);
    
        return new ActionRowBuilder().addComponents(decline, accept);
    }

    createSelectOption(id, label){

        return new StringSelectMenuOptionBuilder()
        .setValue(id)
        .setLabel(label);
    }

    createSelectMenu(id, placeholder, options){

        const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(placeholder)
        .setOptions(options);
    
        return new ActionRowBuilder().addComponents(selectMenu);
    }

}

const updateDeclined = async (confirm) => {

    const embed = new EmbedBuilder()
    .setTitle('❌ Window has been closed.')
    .setColor('Red');
    await confirm.update({ embeds: [embed], components: [] });
}

const waitForResponse = async (interaction, response, target) => {

    const targetTable = {
        "user": i => i.user.id === interaction.user.id,
        "targetUser": i => i.user.id === interaction.options.getUser('user').id,
        "allUsers": i => i.user.id
    };

    try{
    
        return await response.awaitMessageComponent({ filter: targetTable[target], time: 60_000 });

    } catch (error) {
        console.error('Window Expired');
    }
}

const checkResponse = async (response, actions, confirm, type) => {
    try {
        
        const customId = type === "button" 
        ? confirm.customId 
        : confirm.values[0];

        //actions = [{id: function},{id: function},...];

        actions[customId] ? await actions[customId]() : console.log("Error: Invalid Action");

    } catch (error) {
        const failEmbed = new EmbedBuilder()
        .setTitle('❌ Window has expired.')
        .setColor('Red');
        console.log(error);
        return await response.edit({ embeds: [failEmbed], components: [] });
    }
}

const showLevel = async (exp, prevExp, interaction) => {
    
    const currLevel = Math.floor(Math.sqrt(exp / 3));
    const prevLevel = Math.floor(Math.sqrt(prevExp / 3));
    const nextExpReq = 3 *(currLevel + 1)**2;
    const prevExpReq = 3 * (currLevel)**2;
    const lvlMsg = `**Level ${prevLevel} -> ${currLevel}**\n*${exp - prevExpReq} / ${nextExpReq - prevExpReq} EXP*`;

    if(currLevel > prevLevel){
        const embed = new EmbedBuilder()
        .setTitle("LEVEL UP!")
        .setColor("Purple")
        .setDescription(lvlMsg);

        interaction.guildId
        ? await interaction.channel.send({ embeds: [embed] })
        : await interaction.user.send({ embeds: [embed] });
    }

    return `**Level ${prevLevel}**\n*${exp - prevExpReq} / ${nextExpReq - prevExpReq} EXP*`;
}

module.exports = {EmbedRow, waitForResponse, checkResponse, updateDeclined, showLevel};
