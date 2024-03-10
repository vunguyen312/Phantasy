const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

//Embed Utilities

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
    try{

        let userFilter;

        switch(target){
            case "user":
                userFilter = i => i.user.id === interaction.user.id;
                break;
            case "targetUser":
                userFilter = i => i.user.id === interaction.options.getUser('user').id;
                break;
            case "allUser":
                userFilter = i => i.user.id;
                break;
        }
        
        return await response.awaitMessageComponent({ filter: userFilter, time: 60_000 });

    } catch (error) {
        console.log(error);
    }
}

const checkResponse = async (interaction, actions, confirm) => {
    try {

        const { customId } = confirm;

        //actions = [{id: function},{id: function},...];

        actions[customId] ? await actions[customId]() : console.log("Error: Invalid Action");

    } catch (error) {
        const failEmbed = new EmbedBuilder()
        .setTitle('❌ Window has expired.')
        .setColor('Red');
        return await interaction.editReply({ embeds: [failEmbed], components: [] });
    }
}

//JSON Parsing

const fs = require('fs');
const path = require('path');

const jsonFiles = fs.readdirSync("utilities/JSON").filter(file => file.endsWith('.JSON'));
const foldersPath = path.join(__dirname, `./JSON`);

let jsonMap = {};

jsonFiles.forEach(file => {
    fs.readFile(path.join(foldersPath, file), 'utf8', (error, data) => {

        if(error) throw error;
    
        return jsonMap[file.split('.')[0]] = JSON.parse(data);
        
    });
});

//DB Handling

const profileModel = require('../models/profileSchema');

const modifyValue = async (query, operation) => {
    try{
        await profileModel.findOneAndUpdate(query, operation);
    } catch (error) {
        console.log(error);
    }
}

module.exports = { jsonMap, createButton, createConfirmation, modifyValue, waitForResponse, checkResponse, updateDeclined};
