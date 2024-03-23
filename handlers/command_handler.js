const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

module.exports = (client, Discord) => {
    const commands = [];

    const foldersPath = path.join(__dirname, `../commands`);
    const commandFolders = fs.readdirSync(foldersPath);
    let commandFiles = new Map();

    for (const folder of commandFolders) {
	    const commandsPath = path.join(foldersPath, folder);
	    fs.readdirSync(commandsPath).forEach(file => file.endsWith('.js') ? commandFiles.set(file, commandsPath) : undefined);
    }

    for (const [file, commandsPath] of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
    
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
            continue;
        }
        console.log(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    }

    const rest = new REST().setToken(process.env.CLIENT_TOKEN);

    (async () => {
        try {
            console.log(`✓ Refreshing ${commands.length} application (/) commands.`);
    
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
    
            console.log(`✓ Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    })();
}