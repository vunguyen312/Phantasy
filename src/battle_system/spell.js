const { getObjectData } = require("../utilities/dbQuery");
const path = require('path');

class Spell {

    constructor(name, caster, target){
        this.name = name;
        this.hitData;
        this.caster = caster;
        this.target = target;
    }

    async getSpellData(){
        const spellsData = await getObjectData("spells");

        this.hitData = spellsData[this.name];
    }

    async applyStats(){
        await this.getSpellData();

        //PROTOTYPE BUFF SYSTEM
        //BASE_DMG + SCALE FACTOR * SCALING STAT - TARGET_DEF

        if(this.hitData.type === "ST_ATK")
        return this.hitData.base 
        + this.hitData.scale.factor 
        * this.caster.stats[this.hitData.scale.stat]
        - (this.hitData.scale.stat === "ichorAtk" ? this.target.stats.ichorRes : this.target.stats.physRes);

        //STAT UPS
        //BASE_BUFF + SCALE FACTOR * SCALING STAT

        return this.hitData.buff.base + this.hitData.scale.factor * this.caster.stats[this.hitData.scale.stat];
    }

    async castToTarget(){
        const newStat = await this.applyStats();

        switch(this.hitData.type){
            case "ST_ATK": 
            return {
                caster: this.caster,
                type: this.hitData.type,
                attack: this.name,
                damage: newStat,
                cost: this.hitData.cost
            }
            case "ST_BUFF": 
            return {
                caster: this.caster,
                type: this.hitData.type,
                stat: this.hitData.buff.stat,
                attack: this.name,
                buff: newStat,
                cost: this.hitData.cost,
                expiry: this.hitData.expiry
            }
        }
    }

    //Performs a search for a spell's effect and casts it to the target. 
    castEffectToTarget(){
        if(!this.hitData.effect) return;

        let effect = null;
        const foldersPath = path.join(__dirname, `../effects`);

        //Effects won't be that large, so we can afford to use a for...of loop
        for(file of foldersPath){                                                                                     
            const fileName = file.split('.')[0];
            if(fileName !== this.hitData.effect) return;

            effect = require(file);
            break;
        }

        if(effect) return effect;
    }
}

module.exports = Spell;