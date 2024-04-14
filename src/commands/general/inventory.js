const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const getInventoryPage = async (profileData) => {

    if(!profileData.inventory) return { name: 'empty', value: '' };

    const inventoryPage = [];
    const embedSpace = { name: '\u200B', value: '\u200B', inline: true };

    for(item of profileData.inventory){
        //MongoDB documents will return an object in array form.
        const rarity = `Rarity: ${item[1].rarity}`;
        const type = `Type: ${item[1].type}`;
        const amount = `Amount: ${item[1].amount}`;
        const itemProps = { name: `${item[1].name}`, value: `\`${rarity}\n${type}\n${amount}\``, inline: true };
        
        inventoryPage.push(itemProps, embedSpace);
    }
    
    return inventoryPage;
}

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription(`Display all items in your inventory.`),
    syntax: '/inventory',
    conditions: [],
    async execute(interaction, profileData){
        
        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`📈 ${interaction.user.tag}'s Inventory`)
        .setFields(await getInventoryPage(profileData))
        .setThumbnail(interaction.user.displayAvatarURL());

        await interaction.reply({ embeds: [embed] });
    }
}