//Move this to Redis at later date
const spells = {
    "Fireball": {
        type: "ST_ATK",
        scale: { factor: 0.5, stat: "ichorAtk"},
        damage: 50
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

        this.hitData.damage += 
        this.hitData.scale.factor 
        * this.caster.stats[this.hitData.scale.stat]
        - this.target.stats.ichorRes;
    }

    castToTarget(){
        this.applyStats();

        const spellVariants = {
            "ST_ATK": {
                caster: this.caster.self,
                attack: this.name,
                damage: this.hitData.damage,
                healthDeducted: this.target.stats.health - this.hitData.damage
            },
            "ST_BUFF": {
                
            }
        };

        return spellVariants[this.hitData.type];
    }
}

module.exports = {Spell};