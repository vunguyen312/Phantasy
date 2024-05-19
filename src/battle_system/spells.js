//Move this to Redis at later date
const spells = {
    "BASIC ATTACK": {
        type: "ST_ATK",
        scale: { factor: 1, stat: "physAtk" },
        base: 1
    },
    "Fireball": {
        type: "ST_ATK",
        scale: { factor: 0.5, stat: "ichorAtk" },
        base: 50
    },
    "Heal": {
        type: "ST_BUFF",
        scale: { factor: 0.5, stat: "ichorAtk" },
        buff: { base: 50, stat: "health" }
    },
    "Accel": {
        type: "ST_BUFF",
        scale: { factor: 0.5, stat: "ichorAtk" },
        buff: { base: 50, stat: "speed" }
    }
};

class Spell {

    constructor(name, caster, target){
        this.name = name;
        this.hitData = spells[name];
        this.caster = caster;
        this.target = target;
    }

    applyStats(){

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

    castToTarget(){
        const newStat = this.applyStats();

        switch(this.hitData.type){
            case "ST_ATK": 
            return {
                caster: this.caster.self,
                type: this.hitData.type,
                attack: this.name,
                damage: newStat,
            }
            case "ST_BUFF": 
            return {
                caster: this.caster.self,
                type: this.hitData.type,
                stat: this.hitData.buff.stat,
                attack: this.name,
                buff: newStat
            }
        }
    }
}

module.exports = {Spell};