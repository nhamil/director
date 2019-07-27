const task = module.exports; 

/**
 * @param {Creep} c 
 */
task.run = function(c) 
{
    let enemies = _.filter(c.room.find(FIND_CREEPS), c => !c.my);  

    let attack = _.filter(c.body, p => p.type === ATTACK).length > 0; 
    let ranged = _.filter(c.body, p => p.type === RANGED_ATTACK).length > 0; 
    let heal = _.filter(c.body, p => p.type === HEAL).length > 0; 

    if (attack || ranged) 
    {
        if (enemies.length > 0) 
        {
            let e = enemies[0]; 

            c.moveTo(e.pos); 

            if (attack) c.attack(e); 
            if (ranged) c.rangedAttack(e); 
        }
        else 
        {
            c.moveTo(c.room.controller); 
        }
    }
    else if (heal) 
    {
        console.log('TODO: heal'); 
    }
    else 
    {
        console.log(c.name + ' has no combat abilities'); 
        return true; 
    }
}