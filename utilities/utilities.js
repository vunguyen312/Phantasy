//Button Builder

const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

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
