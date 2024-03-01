const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { createButton, createConfirmation, modifyValue, jsonMap } = require('../../utilities/utilities');

const showDeity = async (embed, index, confirm) => {
    const deity = jsonMap.deities.deityTable[index];

    embed
    .setTitle(`${deity.name} - ${deity.modifier}`)
    .setDescription(deity.description)
    .setFields(
        { name: "Religion:", value: deity.religionName },
        { name: "Blessing:", value: deity.blessing },
        { name: "Curse:", value: deity.curse }
    );

    return await confirm.update({ embeds: [embed], components: [] });
}

module.exports = {
    cooldown: 20,
    data: new SlashCommandBuilder()
        .setName('deity')
        .setDescription(`Found a deity for your people to worship!`),
    conditions: [
        {check: (interaction, profileData) => profileData.gold < 10000, msg: `You need 🧈 10,000 gold to found a deity!`}
    ],
    async execute(interaction, profileData){
        const embed = new EmbedBuilder()
        .setColor("White")
        .setTitle(`A Challenger Approaches The Tower...`)
        .setDescription("`Dost thou wish to proceed?`")
        .setImage("https://cdn.discordapp.com/attachments/769659795740688424/1210771403108777985/image.png?ex=65ebc5bd&is=65d950bd&hm=287e92f051136266113aa8df6ba3c9827f05b4427db95f6a0e0aab8686569663&");

        const row = createConfirmation();

        const response = await interaction.reply({ 
            embeds: [embed],
            components: [row]
        });

        const userFilter = i => i.user.id === interaction.user.id;

        try {

            const confirm = await response.awaitMessageComponent({ filter: userFilter, time: 60_000 });

            if (confirm.customId === 'accept') {

                await showDeity(embed, 0, confirm);

            } else if (confirm.customId === 'decline') {

                embed.setTitle('❌ Invite has been declined.');

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