const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const getItemDetails = (item) => {
    const itemDetails = [];

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
            .setName('item_code')
            .setDescription(`The item code of the item you're looking for`)
            .setRequired(true)),
    syntax: '/inspect <item_code>',
    conditions: ["0019"],
    async execute(interaction, profileData){

        const item = profileData.inventory.get(interaction.options.getString('item_code'));

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
        .setFields(getItemDetails(item))
        .setImage(item.img || 'https://cdn.discordapp.com/attachments/479016692501184514/1229228829684531271/bot_icon.png?ex=662eeb8e&is=661c768e&hm=6be8bde7da51b329648cef71d4de8494296980668d9d17ba5567ad3709fbaa04&');

        await interaction.reply({ embeds: [embed] });
    }
}