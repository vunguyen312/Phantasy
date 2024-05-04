const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { modifyValue } = require("../../utilities/dbQuery");
const itemModel = require("../../models/itemSchema");

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('equip')
        .setDescription(`Equip an item in your inventory.`)
        .addStringOption(option => 
            option
            .setName('id')
            .setDescription(`The ID of the item you're equipping.`)
            .setRequired(true)),
    syntax: '/equip <id>',
    conditions: ["0019", "0020"],
    async execute(interaction, profileData){

        const prevWeapon = itemModel.findOne({ identifier: profileData.weapon });
        const itemID = interaction.options.getString('id');
        const item = profileData.inventory.get(itemID);

        const embed = new EmbedBuilder()
        .setColor("DarkPurple")
        .setTitle(`${interaction.user.tag} has equipped ${item.name}`)
        .setImage(item.img || 'https://cdn.discordapp.com/attachments/798592742976389160/1231737321414459475/bot_icon.png?ex=66380bc5&is=662596c5&hm=b9b7952a8d4571e3d32b36d787ebde2e96840be76567c521ff006903a87f0f41&');

        const newStats = {};

        for(stat in profileData.battleStats){
            newStats[stat] = profileData.battleStats[stat] + (item[stat] || 0); 

            if(prevWeapon) newStats[stat] -= (prevWeapon.data[`${stat}`] || 0); 
        }

        console.log(newStats);
        

        await modifyValue(
            "profile",
            { userID: interaction.user.id },
            { $set: { weapon: itemID, battleStats: newStats } }
        );

        await interaction.reply({ embeds: [embed] });
    }
}