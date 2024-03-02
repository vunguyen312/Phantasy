const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { createButton, createConfirmation, modifyValue, jsonMap } = require('../../utilities/utilities');

const showDeity = async (embed, index, interaction, response, confirm) => {
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

    console.log(index);

    const row = new ActionRowBuilder()
        .setComponents(leftArrow, oathButton, rightArrow);

    await confirm.update({ embeds: [embed], components: [row] });

    const userFilter = i => i.user.id === interaction.user.id;

        try {

            const confirm = await response.awaitMessageComponent({ filter: userFilter, time: 60_000 });

            switch(confirm.customId){
                case "oath":
                    await modifyValue(
                        { userID: interaction.user.id },
                        { oath: deity.religionName }
                    );
                    const successEmbed = new EmbedBuilder()
                    .setTitle("Oath Sworn")
                    .setColor("White");
                    await confirm.update({ embeds: [successEmbed], components: [] });
                    break;
                case "leftArrow":
                    index > 0 ? await showDeity(embed, index - 1, interaction, response, confirm) : false;
                    break;
                case "rightArrow":
                    index < jsonMap.deities.deityTable.length ? await showDeity(embed, index + 1, interaction, response, confirm) : false;
                    break;
            }

        } catch (error) {
            console.log(error);
            const failEmbed = new EmbedBuilder()
            .setTitle('❌ Window has expired.')
            .setColor('Red');
            return await interaction.editReply({ embeds: [failEmbed], components: [] });
        }

    return; 
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

        const userFilter = i => i.user.id === interaction.user.id;

        try {

            const confirm = await response.awaitMessageComponent({ filter: userFilter, time: 60_000 });

            switch(confirm.customId){
                case "accept":
                    await showDeity(embed, 0, interaction, response, confirm);
                    break;
                case "decline":
                    embed.setTitle('❌ Invite has been declined.');
                    await confirm.update({ embeds: [embed], components: [] });
                    break;
            }

        } catch (error) {
            console.log(error);
            const failEmbed = new EmbedBuilder()
            .setTitle('❌ Window has expired.')
            .setColor('Red');
            return await interaction.editReply({ embeds: [failEmbed], components: [] });
        }

    }
}