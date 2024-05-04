const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const getItemDetails = (item, itemID) => {
    const itemDetails = [];

    itemDetails.push({ name: "ID", value: `\`${itemID}\`` });

    for([key, value] of Object.entries(item)) {
        if(key === "img" || key === "description" || key === "name") continue;

        itemDetails.push({ name: key.toUpperCase(), value: `\`${value}\`` });
    }

    return itemDetails;
}

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('inspect')
        .setDescription(`Inspect an item in your inventory or someone else's.`)
        .addStringOption(option => 
            option
            .setName('id')
            .setDescription(`The ID or item code of the item you're looking for.`)
            .setRequired(true)),
    syntax: '/inspect <id>',
    conditions: ["0019"],
    async execute(interaction, profileData){

        const itemID = interaction.options.getString('id');
        const item = profileData.inventory.get(itemID);

        const colourTable = {
            "Generic": "Grey",
            "Ordinary": "White",
            "Exceptional": "Green",
            "Precious": "Blue",
            "Fabled": "Purple",
            "Mythos": "Gold"
        };
        
        const embed = new EmbedBuilder()
        .setColor(colourTable[item.rarity])
        .setTitle(item.name)
        .setDescription(item.description)
        .setFields(getItemDetails(item, itemID))
        .setImage(item.img || 'https://cdn.discordapp.com/attachments/798592742976389160/1231737321414459475/bot_icon.png?ex=66380bc5&is=662596c5&hm=b9b7952a8d4571e3d32b36d787ebde2e96840be76567c521ff006903a87f0f41&');

        await interaction.reply({ embeds: [embed] });
    }
}