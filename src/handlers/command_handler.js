const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const refreshCommands = async (commands, rest) => {
    try {

        console.log(`${commands.length > 0 ? '✓' : 'X'} Refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`${data.length > 0 ? '✓' : 'X'} Successfully reloaded ${data.length} application (/) commands.`);

    } catch (error) {
        console.error(error);
    }
}

module.exports = (client, Discord) => {
    const commands = [];

    const foldersPath = path.join(__dirname, `../commands`);
    const commandFolders = fs.readdirSync(foldersPath);
    let commandFiles = new Map();

    for (const folder of commandFolders) {
	    const commandsPath = path.join(foldersPath, folder);
	    fs.readdirSync(commandsPath).forEach(file => file.endsWith('.js') && commandFiles.set(file, commandsPath));
    }

    for (const [file, commandsPath] of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
    
        if (!'data' in command || !'execute' in command) console.log(`The command at ${filePath} is missing a required "data" or "execute" property.`);

        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }

    const rest = new REST().setToken(process.env.CLIENT_TOKEN);

    refreshCommands(commands, rest);

}