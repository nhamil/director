const dir = module.exports; 

/**
 * @param {Room} room 
 */
dir.run = function(room) 
{
    // get to RCL 2 ASAP 
    Director.requestSpawn(room, 'general'); 
    
    

    let creeps = Director.getCreepsByHomeroomAndRoleWithoutTask(room, ['upgrader', 'general', 'builder', 'repairer']);
    Director.log(room.name + ' workers: ' + creeps.length); 

    let all = Director.getCreepsByHomeroomAndRole(room, ['upgrader', 'general', 'builder', 'repairer']);
    Director.log(room.name + ' all workers: ' + all.length); 

    Directive.forEachCreep(creeps, c => assignTask(c, room)); 
}

/**
 * 
 * @param {Creep} c 
 */
let assignTask = function(c, room) 
{console.log('assigning task to ' + c.name); 
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
            id: 'withdraw' 
        });
    }
}