const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { modifyValue, getObjectData } = require('../../utilities/dbQuery');
const { createSelectMenu, createSelectOption, waitForResponse, checkResponse } = require('../../utilities/embedUtils');

const selectedOption = async (interaction, embed, path) => {

    const rewardMinMax = path.success.reward;
    const randomizedReward = Math.round(Math.random() * rewardMinMax[1]);

    await modifyValue(
        "profile",
        { userID: interaction.user.id },
        { $inc: { gold: randomizedReward } }
    );
}

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('explore')
        .setDescription(`Explore and bring back some loot.`),
    syntax: '/explore',
    conditions: [],
    async execute(interaction, profileData) {

        const scenarioTable = await getObjectData("loot");
        const randomScenario = scenarioTable[Math.floor(Math.random() * (scenarioTable.length - 1))];

        const embed = new EmbedBuilder()
        .setColor(randomScenario.hex)
        .setTitle(`🗺️  ${interaction.user.tag}'s Adventure`)
        .setDescription(`${randomScenario.msg}\n\u200B`)
        .setImage(randomScenario.img)
        .setFields(
            { name: 'OPTION A', value: `\`Success Rate: ${randomScenario.paths.A.baseSuccessRate * 100}%\`\n${randomScenario.paths.A.msg}` },
            { name: 'OPTION B', value: `\`Success Rate: ${randomScenario.paths.B.baseSuccessRate * 100}%\`\n${randomScenario.paths.B.msg}` }
        );

        const selectOptions = [
            createSelectOption('a', 'OPTION A'),
            createSelectOption('b', 'OPTION B')
        ];
    
        const row = createSelectMenu('paths', 'Pick an option', selectOptions);

        const response = await interaction.reply({ 
            embeds: [embed], 
            components: [row]
        });

        const confirm = await waitForResponse(interaction, response, "user");

        const actions = {
            "paths": await selectedOption.bind(null, interaction, embed, randomScenario.paths.A),
            "paths": await selectedOption.bind(null, interaction, embed, randomScenario.paths.B)
        };

        await checkResponse(response, actions, confirm);
    }
}