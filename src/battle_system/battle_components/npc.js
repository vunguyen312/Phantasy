const { getObjectData } = require('../../utilities/dbQuery');

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

module.exports = NPC;