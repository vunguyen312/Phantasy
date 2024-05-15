//Move this to Redis at later date
const spells = {
    "Fireball": {
        type: "ST",
        ichorAtk: 50
    }
};

class Spell {

    constructor(name, caster, target){
        this.name = name;
        this.hitData = spells[name];
        console.log()
        this.caster = caster;
        this.target = target;
    }

    castToTarget(){
        return {
            caster: this.caster,
            attack: this.name,
            damage: this.hitData.ichorAtk,
            healthDeducted: this.target.stats.health - this.hitData.ichorAtk
        };
    }
}

module.exports = {Spell};