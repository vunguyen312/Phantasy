const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { EmbedRow, waitForResponse, checkResponse } = require('../../utilities/embedUtils');

const getInventory = async (profileData) => {

    if(!profileData.inventory) return { name: 'empty', value: '' };

    const inventory = [];
    let inventoryPage = [];
    const embedSpace = { name: '\u200B', value: '\u200B', inline: true };
    let counter = 0;

    for(item of profileData.inventory){
        //MongoDB documents will return an object in array form.
        const rarity = `Rarity: ${item[1].rarity}`;
        const type = `Type: ${item[1].type}`;
        const amount = `Amount: ${item[1].amount}`;
        const itemProps = { name: item[1].name, value: `\`${rarity}\n${type}\n${amount}\``, inline: true };
        
        inventoryPage.push(itemProps, embedSpace);
        
        counter++;
        if(counter < 8) continue;

        inventory.push(inventoryPage);
        inventoryPage = [];
        counter = 0;
    }

    if(inventoryPage.length > 0) inventory.push(inventoryPage);
    
    return inventory;
}

const getInventoryPage = async (interaction, response, confirm, embed, inventory, index) => {

    const embedRow = new EmbedRow();

    const leftArrow = embedRow.createButton("leftArrow", "⬅️", ButtonStyle.Secondary);
    const rightArrow = embedRow.createButton("rightArrow", "➡️", ButtonStyle.Secondary);

    const row = new ActionRowBuilder().setComponents(leftArrow, rightArrow);

    embed
    .setFields(inventory[index]);

    if(index - 1 < 0) row.components[0].setDisabled(true);
    else if(index + 1 > inventory.length - 1) row.components[1].setDisabled(true);

    await confirm.update({ embeds: [embed], components: [row] });
    
    const confirm2 = await waitForResponse(interaction, response, "user");
    
    const actions = {
        "leftArrow": await getInventoryPage.bind(null, interaction, response, confirm2, embed, inventory, index - 1),
        "rightArrow": await getInventoryPage.bind(null, interaction, response, confirm2, embed, inventory, index + 1)
    };

    await checkResponse(response, actions, confirm2, "button");

}

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription(`Display all items in your inventory.`),
    syntax: '/inventory',
    conditions: [],
    async execute(interaction, profileData){

        const inventory = await getInventory(profileData);
        
        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`📈 ${interaction.user.tag}'s Inventory`)
        .setFields(inventory[0])
        .setThumbnail(interaction.user.displayAvatarURL());

        const embedRow = new EmbedRow();

        const rightArrow = embedRow.createButton("rightArrow", "➡️", ButtonStyle.Secondary);

        const row = new ActionRowBuilder().setComponents(rightArrow);

        if(inventory.length - 1 <= 0) row.components[0].setDisabled(true);

        const response = await interaction.reply({ embeds: [embed], components: [row] });

        const confirm = await waitForResponse(interaction, response, "user");

        const actions = {
            "rightArrow": await getInventoryPage.bind(null, interaction, response, confirm, embed, inventory, 1)
        };

        await checkResponse(response, actions, confirm, "button");
    }
}