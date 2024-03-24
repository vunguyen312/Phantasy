const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const path = require('path');

const getCommands = () => {
    let commandList = [];

    const commandsFolderPath = path.join(__dirname, `../`);
    const commandFolders = fs.readdirSync(commandsFolderPath);

    for(const folder of commandFolders){
        if(folder === "dev") continue;

        const categoryFolderPath = path.join(__dirname, `../${folder}`);
        const textList = fs.readdirSync(categoryFolderPath).map(file => file.split('.')[0]);

        commandList.push({ name: folder, value: `\`${textList.join(', ')}\``, inline: true });
    }

    return commandList;
}

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays all commands available and their details')
        .addStringOption(option => 
            option
            .setName('command')
            .setDescription('Specify a command to see its details')
            .setRequired(false)),
    conditions: [],
    async execute(interaction){
        const embed = new EmbedBuilder()
        .setColor('Purple')
        .setTitle('📋 Command List')
        .setDescription('`Use /help <command> to get specific details on a command!`')
        .setFields(getCommands());

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}