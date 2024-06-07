const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { EmbedRow, waitForResponse, checkResponse } = require('../../utilities/embedUtils');

const getInventory = async (profileData) => {

    if(!profileData.inventory) return { name: 'empty', value: '' };

    const inventory = [];
    let inventoryPage = [];
    let counter = 0;

    for(item of profileData.inventory){
        const rarity = `Rarity: ${item[1].rarity}`;
        const type = `Type: ${item[1].type}`;
        const itemID = `ID: ${item[0]}`;
        const quantity = !item[1].unique ? `Quantity: ${item[1].quantity}` : "";
        const itemProps = { name: item[1].name, value: `\`${rarity}\n${type}\n${itemID}\n${quantity}\`` };
        
        inventoryPage.push(itemProps);
        
        counter++;
        if(counter < 5) continue;

        inventory.push(inventoryPage);
        inventoryPage = [];
        counter = 0;
    }

    if(inventoryPage.length > 0) inventory.push(inventoryPage);
    
    return inventory;
}

const getInventoryPage = async (interaction, response, confirm, row, embed, inventory, index) => {

    embed
    .setTitle(`📈 ${interaction.user.tag}'s Inventory Pg. ${index + 1}`)
    .setFields(inventory[index]);

    index - 1 < 0 
    ? row.components[0].setDisabled(true)
    : row.components[0].setDisabled(false);

    index + 1 > inventory.length - 1 
    ? row.components[1].setDisabled(true)
    : row.components[1].setDisabled(false);

    await confirm.update({ embeds: [embed], components: [row] });
    
    const confirm2 = await waitForResponse(interaction, response, "user");
    
    const actions = {
        "leftArrow": await getInventoryPage.bind(null, interaction, response, confirm2, row, embed, inventory, index - 1),
        "rightArrow": await getInventoryPage.bind(null, interaction, response, confirm2, row, embed, inventory, index + 1)
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
        .setColor('Grey')
        .setTitle(`📈 ${interaction.user.tag}'s Inventory Pg. 1`)
        .setFields(inventory[0] || { name: `\u200B`, value: `\u200B` });

        const embedRow = new EmbedRow();

        const leftArrow = embedRow.createButton("leftArrow", "⬅️", ButtonStyle.Secondary);
        const rightArrow = embedRow.createButton("rightArrow", "➡️", ButtonStyle.Secondary);

        const row = new ActionRowBuilder().setComponents(leftArrow, rightArrow);

        row.components[0].setDisabled(true);
        if(inventory.length - 1 <= 0) row.components[1].setDisabled(true);

        const response = await interaction.reply({ embeds: [embed], components: [row] });

        const confirm = await waitForResponse(interaction, response, "user");

        const actions = {
            "leftArrow": await getInventoryPage.bind(null, interaction, response, confirm, row, embed, inventory, 0),
            "rightArrow": await getInventoryPage.bind(null, interaction, response, confirm, row, embed, inventory, 1)
        };

        await checkResponse(response, actions, confirm, "button");
    }
}