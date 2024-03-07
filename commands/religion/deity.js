const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { createButton, createConfirmation, waitForResponse, checkResponse, updateDeclined, modifyValue, jsonMap } = require('../../utilities/utilities');

const changeOath = async (interaction, confirm, deity) => {
    await modifyValue(
        { userID: interaction.user.id },
        { oath: deity.religionName, $inc: { gold: -10000 } }
    );
    const successEmbed = new EmbedBuilder()
    .setTitle("Oath Sworn")
    .setColor("White");
    await confirm.update({ embeds: [successEmbed], components: [] });
}

const showDeity = async (interaction, response, confirm, embed, index) => {
    const deity = jsonMap.deities.deityTable[index];

    embed
    .setTitle(`${deity.name} - ${deity.modifier}`)
    .setDescription(deity.description)
    .setFields(
        { name: "Religion:", value: deity.religionName },
        { name: "Blessing:", value: deity.blessing },
        { name: "Curse:", value: deity.curse }
    )
    .setImage(deity.img);

    const leftArrow = createButton("leftArrow", "⬅️", ButtonStyle.Secondary);
    const rightArrow = createButton("rightArrow", "➡️", ButtonStyle.Secondary);
    const oathButton = createButton("oath", "Oath 🙏", ButtonStyle.Primary);

    const row = new ActionRowBuilder()
        .setComponents(leftArrow, oathButton, rightArrow);

    index - 1 < 0 ? row.components[0].setDisabled(true) : false;
    index + 1 > jsonMap.deities.deityTable.length - 1 ? row.components[2].setDisabled(true) : false;

    await confirm.update({ embeds: [embed], components: [row] });

    const confirm2 = await waitForResponse(interaction, response);

    const actions = {
        "oath": await changeOath.bind(null, interaction, confirm2, deity),
        "leftArrow": await showDeity.bind(null, interaction, response, confirm2, embed, index - 1),
        "rightArrow": await showDeity.bind(null, interaction, response, confirm2, embed, index + 1)
    };

    await checkResponse(interaction, actions, confirm2);
}

module.exports = {
    cooldown: 20,
    data: new SlashCommandBuilder()
        .setName('deity')
        .setDescription(`Found a deity for your people to worship!`),
    conditions: [
        {check: (interaction, profileData) => profileData.gold < 10000, msg: `You need 🧈 10,000 gold to found a deity!`},
        {check: (interaction, profileData) => profileData.oath !== "Wanderer", msg: `The path you've chosen is set in stone...`}
    ],
    async execute(interaction, profileData){
        const embed = new EmbedBuilder()
        .setColor("White")
        .setTitle(`A Challenger Approaches The Tower...`)
        .setDescription("`Dost thou wish to proceed?`")
        .setImage("https://cdn.discordapp.com/attachments/769659795740688424/1210771403108777985/image.png?ex=65ebc5bd&is=65d950bd&hm=287e92f051136266113aa8df6ba3c9827f05b4427db95f6a0e0aab8686569663&");

        const response = await interaction.reply({ 
            embeds: [embed],
            components: [createConfirmation()]
        });

        const confirm = await waitForResponse(interaction, response);

        const actions = {
            "accept": await showDeity.bind(null, interaction, response, confirm, embed, 0),
            "decline": await updateDeclined.bind(null, confirm)
        }

        await checkResponse(interaction, actions, confirm);
    }
}