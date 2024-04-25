const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { EmbedRow, waitForResponse, checkResponse } = require("./embedUtils");

class BattleNPC {

    constructor(interaction, player, target, playerStats, targetStats){

        //Players
        this.player = player;
        this.target = target;
        this.playerStats = playerStats;
        this.targetStats = targetStats;

        //UI 
        this.interaction = interaction;
        this.embed;
        this.embedRow = new EmbedRow();
        this.row;
        this.actions;
        this.response;
        this.confirm;
    }

    async createEmbed(){

        this.embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`<@${this.player}> VS <@${this.target}>`)
        .setFields(
            { name: 'Player HP: ', value: `${this.playerStats.get("health")}`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Enemy HP: ', value: `${this.targetStats.health}`, inline: true },
        );

        const basicAtk = this.embedRow.createButton("basic", "🗡️", ButtonStyle.Secondary);

        this.row = new ActionRowBuilder().setComponents(basicAtk);

        this.response = await this.interaction.reply({ 
            embeds: [this.embed],
            components: [this.row]
        });

        this.confirm = await waitForResponse(this.interaction, this.response, "user");

        this.actions = {
            "basic": await this.basicAtk.bind(this),
        }

        await checkResponse(this.response, this.actions, this.confirm, "button");
    }

    async updateEmbed(){

        this.embed.setFields(
            { name: 'Player HP: ', value: `${this.playerStats.get("health")}`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Enemy HP: ', value: `${this.targetStats.health}`, inline: true },
        );

        this.confirm.update({ embeds: [this.embed], components: [this.row] });

        this.confirm = await waitForResponse(this.interaction, this.response, "user");

        await checkResponse(this.response, this.actions, this.confirm, "button");
    }

    async basicAtk(){
        
        const healthDeducted = this.targetStats.health - 10;

        this.targetStats.health = Math.max(0, healthDeducted);

        if(this.targetStats.health === 0) return await this.endGame(this.player);

        await this.updateEmbed();
    }

    async endGame(winner){
        const embed = new EmbedBuilder()
        .setColor(winner === this.player ? "Green" : "Red")
        .setTitle(winner === this.player ? "YOU HAVE WON!" : "YOU HAVE LOST!");

        await this.interaction.editReply({ embeds: [embed], components: [] });
    }
}

module.exports = {BattleNPC}