const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { Battle } = require('../../utilities/battleInteract');
const { EmbedRow, waitForResponse, checkResponse } = require('../../utilities/embedUtils');

module.exports = {
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('dummy')
        .setDescription(`Spawn a combat dummy.`),
    syntax: '/dummy',
    conditions: ["0005"],
    async execute(interaction, profileData){
        
        const battle = new Battle(interaction.user.id, "Dummy", profileData.battleStats, { health: 10000 });
        console.log(battle);

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${interaction.user.tag} has spawned a battle dummy!`)
        .setFields(
            { name: `${interaction.user.tag}`, value: `HP: ${battle.playerStats.get("health")}`},
            { name: `Dummy`, value: `HP: ${battle.targetStats.health}`}
        )
        .setThumbnail(interaction.user.displayAvatarURL());

        const embedRow = new EmbedRow();

        const basicAtk = embedRow.createButton("basic", "🗡️", ButtonStyle.Secondary);

        const row = new ActionRowBuilder().setComponents(basicAtk);

        const response = await interaction.reply({ 
            embeds: [embed],
            components: [row]
        });

        const confirm = await waitForResponse(interaction, response, "user");

        const actions = {
            "basic": await battle.basicAtk.bind(null, interaction, interaction.user.id, "Dummy"),
        }

        await checkResponse(response, actions, confirm, "button");

    }
}