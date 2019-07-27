const task = module.exports; 

/**
 * @param {Creep} creep 
 */
task.run = function(creep, data) 
{
    let roomName = data.roomName || creep.room.name; 
    let target = Game.getObjectById(data.target); 

    if (!target) 
    {
        console.log('Invalid repair ID: ' + data.id); 
        return true; 
    }

    Util.doOrMoveTo(creep, target, 'repair'); 

    return creep.carry[RESOURCE_ENERGY] === 0 || target.hits === target.hitsMax; 
}