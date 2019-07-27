const task = module.exports; 

/**
 * @param {Creep} c 
 */
task.run = function(c, data) 
{
    let id = data.target; 
    let target = Game.getObjectById(id); 

    if (!target) 
    {
        console.log('Invalid target id: ' + id); 
        return true; 
    }

    Util.doOrMoveTo(c, target, 'transfer', {
        arg: RESOURCE_ENERGY 
    });

    return c.carry[RESOURCE_ENERGY] === 0 || 
        (target.energy && (target.energy === target.energyCapacity)) || 
        (target.carry && (_.sum(target.carry) === target.carryCapacity)); 
}