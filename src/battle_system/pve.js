const NPC = require('./battle_components/npc');
const Player = require('./battle_components/player');
const { Queue } = require('../utilities/collections');

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

        //Start the battle
        this.startBattle();

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
    
            if(target.stats.health <= 0) return await this.player.endScreen(caster.self, this.target);
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
        //Checks if the move menu message was forcefully deleted, causing the player's hit data to be empty.
        if(this.playerHitData === null) return;

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
        if(this.playerHitData === null) return;
        this.player.decreaseStatusTimer();

        await this.decideHit();
    }

    getLogs(){
        let result = "";

        for(const log in this.battleLog.elements) result += `\n${this.battleLog.elements[log]}`;

        return result;
    }

}

module.exports = BattlePVE;