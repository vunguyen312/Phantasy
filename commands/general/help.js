const { SlashCommandBuilder, EmbedBuilder, TeamMemberMembershipState } = require("discord.js");
const fs = require('fs');
const path = require('path');
const { jsonMap } = require("../../utilities/jsonParse");

//Might push the command list to MongoDB later...

const getCommand = (folder, commandMap, commandList) => {
    if(folder === "dev") return;

    const categoryFolderPath = path.join(__dirname, `../${folder}`);
    const textList = fs.readdirSync(categoryFolderPath).map(file => {
        const commandName = file.split('.')[0];
        commandMap[commandName] = path.join(categoryFolderPath, file);

        return commandName;
    });

    commandList.push({ name: folder, value: `\`${textList.join(', ')}\``, inline: true });
}

const createCommandList = () => {
    const commandList = [];
    const commandMap = {};
    const commandsFolderPath = path.join(__dirname, `../`);
    const commandFolders = fs.readdirSync(commandsFolderPath);

    commandFolders.forEach(folder => getCommand(folder, commandMap, commandList));

    return { commandList, commandMap };
}

//One and done function call because the list of commands never changes if the bot doesn't restart.
const commandsInfo = createCommandList();

const getCommandDetails = async (interaction, embed, inputtedCommand) => {
    const command = require(commandsInfo.commandMap[inputtedCommand]);
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
        
        if(inputtedCommand) return await getCommandDetails(interaction, embed, inputtedCommand);

        embed
        .setTitle('📋 Command List')
        .setDescription('`Use /help <command> to get specific details on a command!`')
        .setFields(commandsInfo.commandList);

        await interaction.user.send({ embeds: [embed] });
    }
}