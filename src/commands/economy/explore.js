const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { modifyValue, getObjectData } = require('../../utilities/dbQuery');
const { EmbedRow, waitForResponse, checkResponse } = require('../../utilities/embedUtils');

const success = async (interaction, confirm, path) => {

    const rewardMinMax = path.success.reward;
    const randomizedReward = Math.round(Math.random() * rewardMinMax[0]);

    await modifyValue(
        "profile",
        { userID: interaction.user.id },
        { $inc: { gold: randomizedReward } }
    );

    const embed = new EmbedBuilder()
    .setTitle("🗺️ Successful Exploration!")
    .setColor("Green")
    .setDescription(path.success.msg)
    .setFields({ name: "Rewards: ", value: `🧈 ${randomizedReward} Gold` });

    await confirm.update({ embeds: [embed], components: [] });
}

const fail = async (interaction, confirm, path) => {

    const rewardMinMax = path.fail.reward;
    const randomizedReward = Math.round(Math.random() / rewardMinMax);

    await modifyValue(
        "profile",
        { userID: interaction.user.id },
        { $inc: { gold: -randomizedReward } }
    );

    const embed = new EmbedBuilder()
    .setTitle("🗺️ Failed Exploration!")
    .setColor("Red")
    .setDescription(path.fail.msg)
    .setFields({ name: "Gold Lost: ", value: `🧈 ${randomizedReward} Gold` });

    await confirm.update({ embeds: [embed], components: [] });
}

const selectedOption = async (interaction, confirm, path) => {

    const successRate = path.baseSuccessRate;
    const randomRoll = Math.random();

    randomRoll <= successRate 
    ? await success(interaction, confirm, path) 
    : await fail(interaction, confirm, path);
    
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

        const embedRow = new EmbedRow();

        const selectOptions = [
            embedRow.createSelectOption('a', 'OPTION A'),
            embedRow.createSelectOption('b', 'OPTION B')
        ];
    
        const row = embedRow.createSelectMenu('paths', 'Pick an option', selectOptions);

        const response = await interaction.reply({ 
            embeds: [embed], 
            components: [row]
        });

        const confirm = await waitForResponse(interaction, response, "user");

        const actions = {
            "a": await selectedOption.bind(null, interaction, confirm, randomScenario.paths.A),
            "b": await selectedOption.bind(null, interaction, confirm, randomScenario.paths.B)
        };

        await checkResponse(response, actions, confirm, "select");
    }
}