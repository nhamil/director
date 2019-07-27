const dir = module.exports; 

/**
 * @param {Room} room 
 */
dir.run = function(room) 
{
    let creeps = Director.getCreepsByHomeroomAndRole(room, ['upgrader', 'general', 'builder', 'repairer']);
    let upgraders = Director.getCreepsByHomeroomAndRole(room, ['upgrader', 'general']);
    let idle = _.filter(creeps, c => !Directive.doesCreepHaveTask(c)); 

    // TODO this is without task 
    if (creeps.length < 2 || upgraders.length < 2) 
    {
        Director.requestSpawn(room, 'upgrader', creeps.length === 0, creeps.length === 0 ? 1000 : 100); 
    }

    Directive.forEachCreep(idle, c => assignTask(c, room)); 
}

/**
 * 
 * @param {Creep} c 
 */
let assignTask = function(c, room) 
{
    if (c.carry.energy) 
    {
        // have energy, go upgrade controller 
        Directive.assignTaskToCreep(c, {
            id: 'upgrade', 
            target: room.name
        });
    }
    else 
    {
        // go get energy 
        Directive.assignTaskToCreep(c, {
            id: 'withdraw', 
            dontPrioritizePickup: true  
        });
    }
}