const { EmbedBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { EmbedRow, componentResponse } = require("../../utilities/embedUtils");
const { getObjectData, modifyValue, createItem, hasItem } = require('../../utilities/dbQuery');
const { Spell } = require('../spell');

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
        this.mainUI = null;
        this.moveEmbed = null;
        this.embedRow = new EmbedRow();
        this.row = null;
        this.actions = null;
        this.response = null;
        this.confirm = null;
        this.moves = null;
    }

    async castSpell(spellName, target){
        const spell = new Spell(spellName, this, target);

        return spell.castToTarget();
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

        this.mainUI = this.interaction.channel 
        ? await this.interaction.channel.send({ embeds: [this.embed] })
        : await this.interaction.user.send({ embeds: [this.embed] });

        return await this.createMoveSelector(battle, this.stats.ichor);
    }

    async updateEmbed(targetStats, logs, battle){
        try{

            this.embed
            .setDescription(`TURN ENDS: <t:${Math.round((Date.now() + 60_000) / 1000)}:R>\n ${logs}`)
            .setFields(
                { name: 'Player HP:', value: `\`${this.stats.health}\``, inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: 'Enemy HP:', value: `\`${targetStats.health}\``, inline: true },
            );

            await this.mainUI.edit({ embeds: [this.embed] });
            return await this.createMoveSelector(battle, this.stats.ichor);

        } catch(error) {
            const targetInfo = await battle.target.getStats();
            return this.mainUI = await this.createEmbed(battle, battle.target.self, battle.target.stats, targetInfo.img);
        }
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

        if(attack === "deleted") return null;

        await this.deleteMoveSelector(battle);

        //Reopen the move selector if ichor is insufficient
        if(attack && this.stats.ichor - attack.cost < 0) return this.createMoveSelector(battle, `${this.stats.ichor} *INSUFFICIENT ICHOR*`);

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

    async giveDrops(target){
        const drops = await target.calculateDrops();
        const itemsList = await getObjectData("items");
        let dropString = '';

        for(let i = 0; i < drops.length; i++){
            if(!drops[i]) continue;

            const item = itemsList[drops[i]];
            const identifier = await createItem(this.interaction.user.id, drops[i], item);
            
            if(!await hasItem(this.interaction.user.id, item.itemCode))
            await modifyValue(
                "profile",
                { userID: this.interaction.user.id },
                { $set: { [`inventory.${item.unique ? identifier : item.itemCode}`]: item } }
            );
            
            if(!item.unique)
            await modifyValue(
                "profile",
                { userID: this.interaction.user.id },
                { $inc: { [`inventory.${item.itemCode}.quantity`]: 1 } }
            );
            
            dropString += `\n\`${item.name}\``;
        }

        return dropString;
    }

    async endScreen(winner, target){
        const { gold } = target;
        
        const itemsDropped = winner === this.self 
        ? await this.giveDrops(target) 
        : null;

        const randomizedGold = winner === this.self 
        ? Math.round(Math.random() * gold)
        : 0;

        await modifyValue(
            'profile', 
            { userID: this.interaction.user.id },
            { $inc: { gold: randomizedGold } }
        );

        const embed = new EmbedBuilder()
        .setColor(winner === this.self ? "Green" : "Red")
        .setTitle(winner === this.self ? "YOU HAVE WON!" : "YOU HAVE LOST!")
        .setDescription(`Gold Dropped: ${randomizedGold} \n Items Dropped: ${itemsDropped || "`None`"}`);

        this.interaction.channel 
        ? await this.interaction.channel.send({ embeds: [embed] })
        : await this.interaction.user.send({ embeds: [embed] });
        
        //There are cases where mainUI may be inaccessible
        try {
            
            await this.mainUI.delete();

        } catch {}

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
        this.gold = retrievedStats.gold;
        this.drops = retrievedStats.drops;
        return retrievedStats;
    }

    dropItem(dropData){
        const randomNumber = Math.random();
        const { chance, item } = dropData;

        if(randomNumber <= chance) return item;
    }

    async calculateDrops(){
        const drops = this.drops.map(dropData => this.dropItem(dropData));

        return drops;
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

module.exports = Player;