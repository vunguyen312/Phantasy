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
            .setDescription(`The item code of the item you're looking for`)
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
        .setImage(item.img || 'https://lh3.googleusercontent.com/pw/AP1GczPzRsTXun38hax6Tp3f4mildrZO5SPymIYdERVdAGa2cX87UQO4gEBQ9K7u0tyhhoTzwPtNwm0msn8ANkaNlkzL0PWNlAs-hHIs6qVH2R_HNizWXgXKAl3zHgnO_QPS3u5NuMi8xtr8yIZkz-iAJtpImLqH-8-3RGJ5b0U7UwQThp5Nbqz60nfMBABbPH_Oi4atsvmuaFkatIGDqFlsechU6PbNY4W9jeQOwVTmBEkyZP8x-W1zez8XAWm6Aol-SoNbwJTuZR2X7F747Du1XwZSOR5Tf0OYMEMYsB53D-Ayl-vW4r08CYBhA5Zc_ZM1bIr1zOwdxj1jbzdBZhfmiXGv2Ry_uHvJcd3X2s18RuA9Pa6ukKRncfjdNfg9rhYVY8Yk0cqTQfbMtQPV2du9uqTGjgUQbcPG6Nn8WDbumkT1j7lY0VJ6EEk7wqfN1tUBV-YJ2eKsv0_VGceYsGo9TYa5fS8yTLTM1yicuoUa6QMwe4oPcj2ONAAEYLgueX23phKsfUOtZwrNoIJ77OqCI9i5VeAeDUl1uPzoEi95Gwk1pQvI81px9PoNdqItpWIukqmnMtRAX8WtRrPqUAzQZLwCKfeUT0pBSmGjIzC--0BYf4T8sBKFqTi86hqjUEff9Aago4I8M4tfK6DpH2AMvy4oMWzrzoAUw7D9_KmOMJ_SY-FS_Q7e5XcmoGfnvRADZrs1EXgVUT4n6orF_O15KYZE-Ji_59FE2eQdCPrNB4SqOv4egonQxPFDGrHff0Qh-tQ3sKXDD68cOk3YK_DFRURgDqyYahRFOiM2gZWb4Eez_GJQjVhdOPZtzJNg49ZI8s71x2MLzjZiqM2CMyaVJuNqCss8DWT84Y5-YHX4WnEFkFeBzJLxD8VrW-jPsmNOsPtQg9Ve9XcKGcuixAOkNG5H4tU=w953-h953-s-no-gm?authuser=0');

        await interaction.reply({ embeds: [embed] });
    }
}