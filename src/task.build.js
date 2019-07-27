const task = module.exports; 

/**
 * @param {Creep} c 
 */
task.run = function(c, data) 
{
    let id = data.target; 
    let target = Game.getObjectById(id); 

    if (!id || !target) 
    {
        console.log('Build target is invalid: ' + id); 
        return true; 
    }

    Util.doOrMoveTo(c, target, 'build'); 

    return c.carry.energy === 0; 
}