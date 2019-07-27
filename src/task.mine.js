const task = module.exports; 

/**
 * @param {Creep} creep 
 */
task.run = function(creep, data)  
{
    let pos = Util.getRoomPositionReadData(data.pos); 
    if (!pos) 
    {
        console.log('Invalid target position, cannot mine'); 
        return true; 
    }

    let target = Game.getObjectById(data.target); 
    if (!target) 
    {
        console.log('Invalid target ID (did a container decay?), cannot mine'); 
        return true; 
    }

    if (!Util.arePositionsEqual(creep.pos, pos)) 
    {
        let status = creep.moveTo(pos); 
        if (status !== OK) 
        {
            creep.moveTo(target); 
        }
    }
    else creep.harvest(target);
}