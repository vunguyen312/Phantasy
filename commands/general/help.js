const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const path = require('path');

const getCommands = () => {
    let commandList = [];
    let commandMap = {};

    const commandsFolderPath = path.join(__dirname, `../`);
    const commandFolders = fs.readdirSync(commandsFolderPath);

    for(const folder of commandFolders){
        if(folder === "dev") continue;

        const categoryFolderPath = path.join(__dirname, `../${folder}`);
        const textList = fs.readdirSync(categoryFolderPath).map(file => {
            const commandName = file.split('.')[0];
            commandMap[commandName] = path.join(categoryFolderPath, file);

            return commandName;
        });

        commandList.push({ name: folder, value: `\`${textList.join(', ')}\``, inline: true });
    }

    return { commandList, commandMap };
}

const getCommandDetails = async (interaction, embed, commandMap, inputtedCommand) => {
    const command = require(commandMap[inputtedCommand]);

    const commandOptions = command.data.options.map(option => ({ name: `<${option.name}>`, value: `\`Required: ${option.required}\`\n${option.description}`, inline: true }));
    
    embed
    .setTitle(command.data.name)
    .setDescription(`\`${command.syntax}\`\n ${command.data.description}`)
    .setFields(commandOptions);

    return await interaction.user.send({ embeds: [embed] });
}

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays all commands available and their details.')
        .addStringOption(option => 
            option
            .setName('command')
            .setDescription('Specify a command to see its details.')
            .setRequired(false)),
    syntax: '/help <command>',
    conditions: [],
    async execute(interaction){
        await interaction.reply({ content: 'Sent to Direct Messages', ephemeral: true });

        const embed = new EmbedBuilder()
        .setColor('Purple');

        const inputtedCommand = interaction.options.getString('command');
        const commandsInfo = getCommands();
        
        if(inputtedCommand) return await getCommandDetails(interaction, embed, commandsInfo.commandMap, inputtedCommand);

        embed
        .setTitle('📋 Command List')
        .setDescription('`Use /help <command> to get specific details on a command!`')
        .setFields(commandsInfo.commandList);

        await interaction.user.send({ embeds: [embed] });
    }
}