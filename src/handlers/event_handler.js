const fs = require('fs');
const path = require('path');

const attachEvent = (client, Discord, file, folderPath) => {
    const event = require(path.join(folderPath, file));
    const eventName = file.split('.')[0];

    client.on(eventName, event.bind(null, client, Discord));
}

const loadDirectory = (client, Discord, dir) => {
    const folderPath = path.join(__dirname, `../events/${dir}`);
    const eventFiles = fs.readdirSync(`./src/events/${dir}`).filter(file => file.endsWith('.js'));

    eventFiles.forEach(file => attachEvent(client, Discord, file, folderPath));
}

const dirs = ['client', 'guild'];

module.exports = (client, Discord) => dirs.forEach(dir => {
    loadDirectory(client, Discord, dir);
    console.log(`✓ ${dir} has been loaded.`);
});
