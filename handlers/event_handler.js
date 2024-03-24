const fs = require('fs');
const path = require('path');

const attachEvent = (client, Discord, file, folderPath) => {
    const event = require(path.join(folderPath, file));
    const eventName = file.split('.')[0];

    client.on(eventName, event.bind(null, client, Discord));
}

const loadDirectory = (client, Discord, dirs) => {
    const folderPath = path.join(__dirname, `../events/${dirs}`);
    const eventFiles = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js'));

    eventFiles.forEach(file => attachEvent(client, Discord, file, folderPath));
}

module.exports = (client, Discord) => ['client', 'guild'].forEach(dir => {
    loadDirectory(client, Discord, dir);
    console.log(`✓ ${dir} has been loaded.`);
});
