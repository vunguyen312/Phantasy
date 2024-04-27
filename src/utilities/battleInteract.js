const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { EmbedRow, waitForResponse, checkResponse } = require("./embedUtils");
const { getObjectData } = require('./dbQuery');

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

    async basicAtk(target, battle){

        if(target.selfStats.speed > this.playerStats.get("speed")){
            const targetAtk = await target.basicAtk();
            if(targetAtk === "Ended") return;
        }

        const targetStats = target.selfStats;
        const damage = this.playerStats.get("physAtk");
        const healthDeducted = targetStats.health - damage;

        targetStats.health = Math.max(0, healthDeducted);

        if(targetStats.health <= 0) return await this.endScreen(this.player);

        await battle.nextTurn(`\`${this.player} used [BASIC ATTACK] and dealt ${damage} DMG\``);
    }

    async createEmbed(battle, target, targetStats, image){

        this.embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`${this.player} VS. ${target}`)
        .setImage(image)
        .setFields(
            { name: 'Player HP:', value: `\`${this.playerStats.get("health")}\``, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Enemy HP:', value: `\`${targetStats.health}\``, inline: true },
        );

        const basicAtk = this.embedRow.createButton("basic", "🗡️", ButtonStyle.Secondary);

        this.row = new ActionRowBuilder().setComponents(basicAtk);

        this.response = await this.interaction.reply({ 
            embeds: [this.embed],
            components: [this.row]
        });

        this.confirm = await waitForResponse(this.interaction, this.response, "user");

        this.actions = {
            "basic": await this.basicAtk.bind(this, battle.target, battle),
        }

        await checkResponse(this.response, this.actions, this.confirm, "button");
    }

    async updateEmbed(targetStats, logs){

        this.embed
        .setDescription(logs)
        .setFields(
            { name: 'Player HP:', value: `\`${this.playerStats.get("health")}\``, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Enemy HP:', value: `\`${targetStats.health}\``, inline: true },
        );

        await this.confirm.update({ embeds: [this.embed], components: [this.row] });

        this.confirm = await waitForResponse(this.interaction, this.response, "user");

        await checkResponse(this.response, this.actions, this.confirm, "button");

    }

    async endScreen(winner){

        const embed = new EmbedBuilder()
        .setColor(winner === this.player ? "Green" : "Red")
        .setTitle(winner === this.player ? "YOU HAVE WON!" : "YOU HAVE LOST!");

        await this.interaction.editReply({ embeds: [embed], components: [] });

        return "Ended";
    }
}

class NPC {

    constructor(self, target){

        this.self = self;
        this.selfStats;
        this.target = target;
        this.targetStats = this.target.playerStats;
    }

    async getStats(){

        const retrievedStats = await getObjectData("monsters");

        this.selfStats = retrievedStats[this.self].stats;
        return retrievedStats[this.self];
    }

    async basicAtk(){
        
        const healthDeducted = this.targetStats.get("health") - this.selfStats.physAtk - 10;

        this.targetStats.set("health", Math.max(0, healthDeducted));

        if(this.targetStats.get("health") <= 0) return await this.target.endScreen(this.self);
        
        return `\`${this.self} used [BASIC ATTACK] and dealt ${this.selfStats.physAtk} DMG\``;
    }
}

class BattlePVE {

    constructor(interaction, player, target, playerStats){

        this.player = new Player(interaction, player, playerStats);
        this.target = new NPC(target, this.player);

        this.battleLog = [];
        this.turn = 1;
        this.currentTurn = player;
    }

    async nextTurn(log){

        this.currentTurn = this.currentTurn === this.player.player
        ? this.target.self
        : this.player.player;


        if(this.battleLog.length >= 5){
            this.battleLog.shift();
            this.battleLog.shift();
            this.battleLog.shift();
        }
        this.battleLog.push(`*Turn ${this.turn}:*`, log, monsterHit);

        this.turn++;

        await this.player.updateEmbed(this.target.selfStats, this.battleLog.join('\n'));
    }

    async startBattle(){

        const targetInfo = await this.target.getStats();

        await this.player.createEmbed(this, this.target.self, this.target.selfStats, targetInfo.img);
    }
}

module.exports = {BattlePVE}