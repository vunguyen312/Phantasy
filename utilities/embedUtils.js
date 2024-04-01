const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, UserSelectMenuBuilder } = require("discord.js");

const createButton = (id, label, style) => {
    return new ButtonBuilder()
    .setCustomId(id)
	.setLabel(label)
	.setStyle(style);
}

const createConfirmation = () => {
    const accept = createButton('accept', 'Accept ✔️', ButtonStyle.Success);
    const decline = createButton('decline', 'Decline ❌', ButtonStyle.Danger);

    const row = new ActionRowBuilder()
        .addComponents(decline, accept);

    return row;
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

const checkResponse = async (response, actions, confirm) => {
    try {

        const { customId } = confirm;

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

module.exports = {createButton, createConfirmation, waitForResponse, checkResponse, updateDeclined};
