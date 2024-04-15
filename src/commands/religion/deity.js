const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { EmbedRow, waitForResponse, checkResponse, updateDeclined } = require('../../utilities/embedUtils');
const { modifyValue } = require('../../utilities/dbQuery');
const { getObjectData } = require('../../utilities/dbQuery');

const changeOath = async (interaction, confirm, deity) => {
    await modifyValue(
        "profile",
        { userID: interaction.user.id },
        { oath: deity.religionName, $inc: { gold: -10_000 } }
    );
    const successEmbed = new EmbedBuilder()
    .setTitle("Oath Sworn")
    .setColor("White");
    await confirm.update({ embeds: [successEmbed], components: [] });
}

const showDeity = async (interaction, response, confirm, embed, index) => {
    const deityTable = await getObjectData("deities");
    const deity = deityTable[index];

    embed
    .setTitle(`${deity.name} - ${deity.modifier}`)
    .setDescription(deity.description)
    .setFields(
        { name: "Religion:", value: deity.religionName },
        { name: "Blessing:", value: deity.blessing },
        { name: "Curse:", value: deity.curse }
    )
    .setImage(deity.img);

    const embedRow = new EmbedRow();

    const leftArrow = embedRow.createButton("leftArrow", "⬅️", ButtonStyle.Secondary);
    const rightArrow = embedRow.createButton("rightArrow", "➡️", ButtonStyle.Secondary);
    const oathButton = embedRow.createButton("oath", "Oath 🙏", ButtonStyle.Primary);

    const row = new ActionRowBuilder().setComponents(leftArrow, oathButton, rightArrow);

    if(index - 1 < 0) row.components[0].setDisabled(true);
    else if(index + 1 > deityTable.length - 1) row.components[2].setDisabled(true);

    await confirm.update({ embeds: [embed], components: [row] });

    const confirm2 = await waitForResponse(interaction, response, "user");

    const actions = {
        "oath": await changeOath.bind(null, interaction, confirm2, deity),
        "leftArrow": await showDeity.bind(null, interaction, response, confirm2, embed, index - 1),
        "rightArrow": await showDeity.bind(null, interaction, response, confirm2, embed, index + 1)
    };

    await checkResponse(response, actions, confirm2, "button");
}

module.exports = {
    cooldown: 20,
    data: new SlashCommandBuilder()
        .setName('deity')
        .setDescription(`Found a deity for your people to worship.`),
    syntax: '/deity',
    conditions: ["0017", "0018"],
    async execute(interaction, profileData){
        
        const embed = new EmbedBuilder()
        .setColor('White')
        .setTitle('A Challenger Approaches The Tower...')
        .setDescription("`Dost thou wish to proceed?`")
        .setImage('https://cdn.discordapp.com/attachments/769659795740688424/1210771403108777985/image.png?ex=65ebc5bd&is=65d950bd&hm=287e92f051136266113aa8df6ba3c9827f05b4427db95f6a0e0aab8686569663&');

        await interaction.reply({ content: 'Sent to Direct Messages', ephemeral: true });

        const confirmation = new EmbedRow().createConfirmation();
        
        const response = await interaction.user.send({ 
            embeds: [embed],
            components: [confirmation]
        });

        const confirm = await waitForResponse(interaction, response, "user");

        const actions = {
            "accept": await showDeity.bind(null, interaction, response, confirm, embed, 0),
            "decline": await updateDeclined.bind(null, confirm)
        }

        await checkResponse(response, actions, confirm, "button");
    }
}