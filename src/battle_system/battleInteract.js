const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { EmbedRow, componentResponse } = require("../utilities/embedUtils");
const { getObjectData } = require('../utilities/dbQuery');
const { Spell } = require('./spells');
const { Queue } = require('../utilities/collections');

//#COMBATANTS

class Player {

    constructor(interaction, player, playerStats){
        //Player
        this.self = player;
        this.baseStats = Object.assign({}, playerStats);
        this.stats = Object.assign({}, playerStats);
        this.spells = {};
        this.buffs = {};

        //Main UI
        this.interaction = interaction;
        this.embed;

        //Battle UI
        this.moveEmbed;
        this.embedRow = new EmbedRow();
        this.row;
        this.actions;
        this.response;
        this.confirm;
        this.moves;
    }

    castSpell(spellName, target){
        const spell = new Spell(spellName, this, target);

        return spell.castToTarget();
    }

    //Embeds

    async createEmbed(battle, target, targetStats, image){
        this.embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`${this.self} VS. ${target}`)
        .setDescription(`TURN ENDS: <t:${Math.round((Date.now() + 60_000) / 1000)}:R>`)
        .setImage(image)
        .setFields(
            { name: 'Player HP:', value: `\`${this.stats.health}\``, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Enemy HP:', value: `\`${targetStats.health}\``, inline: true },
        );

        await this.interaction.reply({ embeds: [this.embed] });

        return await this.createMoveSelector(battle);
    }

    async updateEmbed(targetStats, logs, battle){
        this.embed
        .setDescription(`TURN ENDS: <t:${Math.round((Date.now() + 60_000) / 1000)}:R>\n ${logs}`)
        .setFields(
            { name: 'Player HP:', value: `\`${this.stats.health}\``, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Enemy HP:', value: `\`${targetStats.health}\``, inline: true },
        );

        await this.interaction.editReply({ embeds: [this.embed] });

        return await this.createMoveSelector(battle);
    }

    async createMoveSelector(battle){
        this.moveEmbed = new EmbedBuilder()
        .setColor("Blurple")
        .setDescription(`Current Ichor: ${this.ichor}`);

        const basicAtk = this.embedRow.createButton("basic", "🗡️", ButtonStyle.Secondary);
        const spell1 = this.embedRow.createButton("spell1", `${this.spells[0]}`, ButtonStyle.Secondary);
        const spell2 = this.embedRow.createButton("spell2", `${this.spells[1]}`, ButtonStyle.Secondary);
        const spell3 = this.embedRow.createButton("spell3", `${this.spells[2]}`, ButtonStyle.Secondary);
        const spell4 = this.embedRow.createButton("spell4", `${this.spells[3]}`, ButtonStyle.Secondary);

        this.row = new ActionRowBuilder().setComponents(basicAtk, spell1, spell2, spell3, /*spell4*/);

        this.response = await this.interaction.channel.send({ 
            embeds: [this.moveEmbed],
            components: [this.row]
        });

        this.actions = {
            "basic": this.castSpell.bind(this, "BASIC ATTACK", battle.target),
            "spell1": this.castSpell.bind(this, "Fireball", battle.target),
            "spell2": this.castSpell.bind(this, "Heal", this),
            "spell3": this.castSpell.bind(this, "Accel", this)
        };

        const attack = await componentResponse(this.interaction, this.response, this.actions, "user", "button");

        await this.deleteMoveSelector(battle);

        return attack;
    }

    async deleteMoveSelector(){
        this.response.delete();
        this.response = null;
        this.row = null;
        this.confirm = null;
        this.actions = null;
    }

    async endScreen(winner){
        const embed = new EmbedBuilder()
        .setColor(winner === this.self ? "Green" : "Red")
        .setTitle(winner === this.self ? "YOU HAVE WON!" : "YOU HAVE LOST!");

        await this.interaction.editReply({ embeds: [embed], components: [] });

        const client = this.interaction.client;

        client.locked.delete(this.interaction.user.id);

        return 'Ended';
    }
}

class NPC {

    constructor(self, target){
        this.self = self;
        this.stats;
        this.target = target;
        this.buffs = {};
    }

    async getStats(){
        const retrievedStats = await getObjectData("monsters");

        this.stats = retrievedStats[this.self].stats;
        return retrievedStats[this.self];
    }

    basicAtk(){
        const hitData = {
            caster: this.self,
            type: "ST_ATK",
            attack: 'BASIC ATTACK',
            damage: this.stats.physAtk + 10
        };

        return hitData;
    }
}

//#BATTLES

class BattlePVE {

    constructor(interaction, player, target, playerStats){
        this.player = new Player(interaction, player, playerStats);
        this.target = new NPC(target, this.player);

        this.battleLog = new Queue();
        this.playerHitData;
        this.turn = 1;
        this.currentTurn;
        this.awaitingTurn;

        interaction.client.locked.set(interaction.user.id);
    }

    calculateInitiative(){
        const playerSpeed = this.player.stats.speed;
        const monsterSpeed = this.target.stats.speed;

        this.currentTurn = playerSpeed > monsterSpeed
        ? this.player 
        : this.target;

        this.awaitingTurn = this.currentTurn === this.player
        ? this.target
        : this.player;
    }

    async hit(caster, target, hitData){
        if(hitData.type === "ST_ATK"){
            target.stats.health = Math.max(0, target.stats.health - hitData.damage);
            this.battleLog.enqueue(`\`${caster.self} used [${hitData.attack}] and dealt ${hitData.damage} DMG\``);
    
            if(target.stats.health <= 0) return await this.player.endScreen(caster.self);
            return;
        }

        hitData.stat === "health" 
        ? caster.stats[hitData.stat] = Math.min(caster.baseStats[hitData.stat], caster.stats[hitData.stat] + hitData.buff)
        : caster.stats[hitData.stat] += hitData.buff;

        this.battleLog.enqueue(`\`${caster.self} used [${hitData.attack}] and increased ${hitData.stat.toUpperCase()} by ${hitData.buff}\``);
    }

    async decideHit(){
        this.calculateInitiative();

        const currTurnData = this.currentTurn === this.player
        ? this.playerHitData
        : this.target.basicAtk();

        const awaitTurnData = this.currentTurn === this.player
        ? this.target.basicAtk()
        :this.playerHitData;

        if(await this.hit(this.currentTurn, this.awaitingTurn, currTurnData)) return;
        if(await this.hit(this.awaitingTurn, this.currentTurn, awaitTurnData)) return;
        await this.nextTurn();
    }

    async startBattle(){
        const targetInfo = await this.target.getStats();

        this.playerHitData = await this.player.createEmbed(this, this.target.self, this.target.stats, targetInfo.img);

        if(!this.playerHitData.attack) 
        this.playerHitData = {
            caster: this.self,
            type: "ST_ATK",
            attack: 'NO TURN',
            damage: 0,
            healthDeducted: this.target.stats.health
        };

        await this.decideHit();
    }

    async nextTurn(){
        if(this.battleLog.size >= 5){
            this.battleLog.dequeue();
            this.battleLog.dequeue();
        }

        this.turn++;

        this.playerHitData = await this.player.updateEmbed(this.target.stats, this.getLogs(), this);

        if(!this.playerHitData.attack) 
        this.playerHitData = {
            caster: this.self,
            type: "ST_ATK",
            attack: 'NO TURN',
            damage: 0,
            healthDeducted: this.target.stats.health
        };

        await this.decideHit();
    }

    getLogs(){
        let result = "";

        for(const log in this.battleLog.elements) result += `\n${this.battleLog.elements[log]}`;

        return result;
    }

}

module.exports = {BattlePVE}