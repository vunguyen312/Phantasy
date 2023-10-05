const fs = require('fs');
const path = require('path');

module.exports = (client, Discord) =>{
    
    const load_directory = (dirs) => {
        const event_folder_path = path.join(__dirname, `../events/${dirs}`);
        const event_files = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js'));

        for(const file of event_files){
            const event = require(path.join(event_folder_path, file));
            const event_name = file.split('.')[0];

            /*Check if the event we're listening for is interactionCreate or anything else. 
            If it is, we grab interaction as well and push it to interactionCreate.js*/

            client.on(event_name, event.bind(null, client, Discord));

        }
    }

    //Run the load_directory function we made and have our event listeners set up on startup.

    ['client', 'guild'].forEach(e => {
        load_directory(e);
        console.log(`${e} has been loaded.`);
    });

}