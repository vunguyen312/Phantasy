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
        .setImage("https://lh3.googleusercontent.com/pw/AP1GczNx3EUY5VOs4nULqMdkYQMe21a0QJUNocIRIUDjQ3D6pURBC6uyvpeN8PfJ3QNRo5SAkpUNBnhhXfEpWr91xGGILMOujTZ-aV7Tz7XGckR-eMV5FnHA7wz8mXJnjM8icoKyy2JS-6OJ6rs8bbW2m6rrksB5C8Rk9lgkRD1SANI8CeoA2A7BugRr3iCGQynYs7a5297OZASqNNSnkgZAOWnZ5b2ZLEBsgDeFaM_6lsBFrDEvDQqHYTIyc84Dx_rSoaBQF9SSUk3Xq6Vsk3myDFhP5O-ZuYVE5ssDKSAm1tVEiafK09lv1QrKsL2ChnTGNimN1s31qdm0KTnKfzqf2hxT1CQ3hO0Zf8uCq5KBC_76WVfk4lvmqO5WuPyGptczzfuBz9sNRoznWL7XE9hJsQhwDzaAHkPHir0D_7Ju2_gKM_9-SBtkT-qw7GPxJBotqFhexhIh3caNZYLe-uzF_d7nduH14mtqc36vM5j_h6As6UWKCnb9PVT2IFWNbqXG6gRS7IJ1oLvSdPCgHfcFiAvxGtNl-ZqXJZ4TmuzhZYaW8z9LvOQjdMp-1-kjq771dOlDSfqUTb2oRIDvXFCQz4o6xMVxI4_HllMJ6NtDECxum8gRjj_twaMlQrUcMh0zhFD6onLR7fK0sX92SbTiM0QmdurLfp374esEeGziatUNWv7DhTGhtm_FqMPGvh12uPK20WDtWK1nYFa-R0le0Nwg7pUCI2zEoVQRyQosFMTf0xgxwskWXEk5-gV6BMBHgJaSoUyf2Ddzhldvhg1_EXGSlpuK9CwrE6xJvkp518DzHebBbBsxLEfFuvJAiOJ2CbHWrP504Q24fz5b9xkXB5DjSH3_7Xi3sxjz1dOlhICosmDKrbfUCbot7CRUWosHVVR9OCHscsk9GgzsKPGk1dJUz0Y=w601-h467-s-no-gm?authuser=0");

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