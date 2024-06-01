const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { EmbedRow, componentResponse } = require("../utilities/embedUtils");
const { getObjectData } = require('../utilities/dbQuery');
const { Spell } = require('./spells');
const { Queue } = require('../utilities/collections');

//#COMBATANTS

class Player {

    constructor(interaction, player, playerStats, spells){
        //Player
        this.self = player;
        this.baseStats = playerStats;
        this.stats = Object.assign({}, playerStats);
        this.spells = spells;
        this.status = {};

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

    async castSpell(spellName, target){
        const spell = new Spell(spellName, this, target);

        return await spell.castToTarget();
    }

    decreaseStatusTimer(){
        for(const status in this.status){
            const currStatus = this.status[status];
            const { buff, stat } = currStatus;

            currStatus.expiry--;
            if(currStatus.expiry < 0){
                //Rework this system later
                if(status !== "Heal") this.stats[stat] -= buff;
                
                delete this.status[status];
            }
        }
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

        return await this.createMoveSelector(battle, this.stats.ichor);
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

        return await this.createMoveSelector(battle, this.stats.ichor);
    }

    async createMoveSelector(battle, ichor){
        this.moveEmbed = new EmbedBuilder()
        .setColor("Blurple")
        .setDescription(`Current Ichor: ${ichor}`);

        const basicAtk = this.embedRow.createButton("basic", "🗡️", ButtonStyle.Secondary);
        this.row = new ActionRowBuilder().setComponents(basicAtk);

        this.actions = {
            "basic": await this.castSpell.bind(this, "BASIC ATTACK", battle.target)
        };

        for(let i = 0; i < 4; i++){
            const { id, type } = this.spells[i] || { id: "BASIC ATTACK", type: "target" };
            const buttonName = `spell${i + 1}`;

            const newButton = this.embedRow.createButton(buttonName, `${id}`, ButtonStyle.Secondary);
            this.row.addComponents(newButton);

            this.actions[buttonName] = await this.castSpell.bind(this, id, type === "ST_BUFF" ? this : battle.target);
        }

        const msgContent = { embeds: [this.moveEmbed], components: [this.row] };

        this.response = this.interaction.channel 
        ? await this.interaction.channel.send(msgContent)
        : await this.interaction.user.send(msgContent);

        const attack = await componentResponse(this.interaction, this.response, this.actions, "user", "button");

        await this.deleteMoveSelector(battle);

        //Reopen the move selector if ichor is insufficient
        if(attack && this.stats.ichor - attack.cost < 0) 
        return this.createMoveSelector(battle, `${this.stats.ichor} *INSUFFICIENT ICHOR*`);

        //Return a default attack schema if the user doesn't move
        return attack || 
        {
            caster: this,
            type: "ST_ATK",
            attack: 'NO TURN',
            damage: 0,
            healthDeducted: battle.target.stats.health,
            cost: 0
        };
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
        this.status = {};

        //Drops

        this.gold;
        this.drops;
    }

    async getStats(){
        const retrievedStats = (await getObjectData("monsters"))[this.self];

        this.stats = retrievedStats.stats;
        //this.gold = retrievedStats.gold;
        //this.drops = retrievedStats.drops;
        return retrievedStats;
    }

    //TODO: Move selecting AI for NPCs
    //Weighted probability move selection system
    basicAtk(){
        const hitData = {
            caster: this,
            type: "ST_ATK",
            attack: 'BASIC ATTACK',
            damage: this.stats.physAtk
        };

        return hitData;
    }
}

//#BATTLES

class BattlePVE {

    constructor(interaction, player, target, playerStats, spells){
        this.player = new Player(interaction, player, playerStats, spells);
        this.target = new NPC(target, this.player);

        this.battleLog = new Queue();
        this.playerHitData;
        this.turn = 1;

        //Turn Logic Handling

        this.currentTurn;
        this.awaitingTurn;

        interaction.client.locked.set(interaction.user.id);
    }

    calculateInitiative(){
        const playerSpeed = this.player.stats.speed;
        const monsterSpeed = this.target.stats.speed;

        if(playerSpeed > monsterSpeed){
            this.currentTurn = this.playerHitData;
            this.awaitingTurn = this.target.basicAtk();
            return;
        }

        this.currentTurn = this.target.basicAtk();
        this.awaitingTurn = this.playerHitData;
    }

    async hit(target, hitData){
        const { caster, attack, stat } = hitData;

        //Remove ichor per spell cast
        if(target === this.target) this.player.stats.ichor -= hitData.cost;

        if(hitData.type !== "ST_BUFF"){
            target.stats.health = Math.max(0, target.stats.health - hitData.damage);
            this.battleLog.enqueue(`\`${caster.self} used [${attack}] and dealt ${hitData.damage} DMG\``);
    
            if(target.stats.health <= 0) return await this.player.endScreen(caster.self, target);
            return;
        }

        const { buff, expiry } = hitData;

        stat === "health" 
        ? caster.stats[stat] = Math.min(caster.baseStats[stat], caster.stats[stat] + buff)
        : caster.stats[stat] = caster.stats[stat] + buff;

        //Add a turn expiration timer to buffs and debuffs
        this.player.status[attack] = { stat, buff, expiry };

        this.battleLog.enqueue(`\`${caster.self} used [${attack}] and increased ${stat.toUpperCase()} by ${buff}\``);
    }

    async decideHit(){
        this.calculateInitiative();

        if(await this.hit(this.awaitingTurn.caster, this.currentTurn)) return;
        if(await this.hit(this.currentTurn.caster, this.awaitingTurn)) return;

        await this.nextTurn();
    }

    async startBattle(){
        const targetInfo = await this.target.getStats();

        this.playerHitData = await this.player.createEmbed(this, this.target.self, this.target.stats, targetInfo.img);

        await this.decideHit();
    }

    async nextTurn(){
        if(this.battleLog.size >= 5){
            this.battleLog.dequeue();
            this.battleLog.dequeue();
        }

        this.turn++;
        this.player.stats.ichor = Math.min(this.player.baseStats.ichor, this.player.stats.ichor + 5);

        this.playerHitData = await this.player.updateEmbed(this.target.stats, this.getLogs(), this);
        this.player.decreaseStatusTimer();

        await this.decideHit();
    }

    getLogs(){
        let result = "";

        for(const log in this.battleLog.elements) result += `\n${this.battleLog.elements[log]}`;

        return result;
    }

}

module.exports = {BattlePVE}