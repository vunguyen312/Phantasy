//Button Builder

const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

const createButton = (id, label, style) => {
    const button = new ButtonBuilder()
		.setCustomId(id)
		.setLabel(label)
		.setStyle(style);

    return button;
}

const createConfirmation = () => {
    const accept = createButton('accept', 'Accept ✔️', ButtonStyle.Success);
    const decline = createButton('decline', 'Decline ❌', ButtonStyle.Danger);

    const row = new ActionRowBuilder()
        .addComponents(decline, accept);

    return row;
}

/*const checkResponse = async (interaction, response, buttonIDs) => {
    const userFilter = i => i.user.id === interaction.user.id;

    try {

        const confirm = await response.awaitMessageComponent({ filter: userFilter, time: 60_000 });

        //[{id, func},{id, func},...]

        for(let i = 0; i < buttonIDs.length; i++){
            console.log(buttonIDs[i]);
            confirm.customID === buttonIDs[i].id ? false : await buttonIDs[i].func();
        }

    } catch (error) {
        console.log(error);
        const failEmbed = new EmbedBuilder()
        .setTitle('❌ Window has expired.')
        .setColor('Red');
        return await interaction.editReply({ embeds: [failEmbed], components: [] });
    }
}*/

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
        await profileModel.findOneAndUpdate(
            query,
            operation
        );
    } catch (error) {
        console.log(`Problem Modifying Value`);
    }
}

module.exports = { jsonMap, createButton, createConfirmation, modifyValue};
