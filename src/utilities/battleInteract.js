class Battle {

    constructor(player, target, playerStats, targetStats){
        this.player = player;
        this.target = target;
        this.playerStats = playerStats;
        this.targetStats = targetStats;
    }



    basicAtk(interaction, caster, enemy){

        const enemyStats = enemy === this.target 
        ? this.targetStats 
        : this.playerStats;
        
        const healthDeducted = enemyStats.health - 10;

        console.log(enemyStats);

        enemyStats.health = Math.max(0, healthDeducted);

        if(enemyStats.health === 0) return this.endGame(caster);

        console.log(enemyStats);
        
    }

    endGame(winner){
        return console.log(`${winner} has won!`);
    }
}


module.exports = {Battle}