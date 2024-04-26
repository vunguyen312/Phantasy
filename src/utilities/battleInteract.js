const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { EmbedRow, waitForResponse, checkResponse } = require("./embedUtils");

class Player {

    constructor(interaction, player, playerStats){

        this.player = player;
        this.playerStats = playerStats;

        this.interaction = interaction;
        this.embed;
        this.embedRow = new EmbedRow();
        this.row;
        this.actions;
        this.response;
        this.confirm;
    }

    //Attacks

    async basicAtk(target){

        const targetStats = target.selfStats;
        
        const healthDeducted = targetStats.health - 10;

        targetStats.health = Math.max(0, healthDeducted);

        if(targetStats.health <= 0) return await this.endScreen(this.player);

        await target.basicAtk();
    }

    //Embeds

    async createEmbed(battle, target, targetStats){

        this.embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`<@${this.player}> VS <@${target}>`)
        .setFields(
            { name: 'Player HP: ', value: `${this.playerStats.get("health")}`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Enemy HP: ', value: `${targetStats.health}`, inline: true },
        );

        const basicAtk = this.embedRow.createButton("basic", "🗡️", ButtonStyle.Secondary);

        this.row = new ActionRowBuilder().setComponents(basicAtk);

        this.response = await this.interaction.reply({ 
            embeds: [this.embed],
            components: [this.row]
        });

        this.confirm = await waitForResponse(this.interaction, this.response, "user");

        this.actions = {
            "basic": await this.basicAtk.bind(this, battle.target),
        }

        await checkResponse(this.response, this.actions, this.confirm, "button");
    }

    async updateEmbed(targetStats){

        this.embed.setFields(
            { name: 'Player HP: ', value: `${this.playerStats.get("health")}`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Enemy HP: ', value: `${targetStats.health}`, inline: true },
        );

        this.confirm.update({ embeds: [this.embed], components: [this.row] });

        this.confirm = await waitForResponse(this.interaction, this.response, "user");

        await checkResponse(this.response, this.actions, this.confirm, "button");
    }

    async endScreen(winner){

        const embed = new EmbedBuilder()
        .setColor(winner === this.player ? "Green" : "Red")
        .setTitle(winner === this.player ? "YOU HAVE WON!" : "YOU HAVE LOST!");

        await this.interaction.editReply({ embeds: [embed], components: [] });
    }
}

class NPC {

    constructor(self, selfStats, target){

        this.self = self;
        //Replace selfStats with different stats for monsters later 
        this.selfStats = selfStats;
        this.target = target;
        this.targetStats = this.target.playerStats;
    }

    async basicAtk(){
        
        const healthDeducted = this.targetStats.get("health") - 10;
        console.log(healthDeducted);

        this.targetStats.set("health", Math.max(0, healthDeducted));

        if(this.targetStats.get("health") <= 0) return await this.target.endScreen(this.self);

        await this.target.updateEmbed(this.selfStats);
    }
}

class BattlePVE {

    constructor(interaction, player, target, playerStats, targetStats){

        this.player = new Player(interaction, player, playerStats);
        this.target = new NPC(target, targetStats, this.player);
    }

    async startBattle(){

        await this.player.createEmbed(this, this.target.self, this.target.selfStats);
    }
}

module.exports = {BattlePVE}