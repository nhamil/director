global.Directive = module.exports; 

const statusShorthands = 
{
    harvest: '🌾',
    mine: '⛏️',  
    upgrade: '💪', 
    build: '🏗️', 
    supply: '🚚', 
    withdraw: '🌾', 
    repair: '🛠️' 
};

/**
 * @param {Creep} creep 
 */
Directive.assignTaskToCreep = function(creep, taskInfo) 
{
    creep.memory.task = taskInfo; 
    let status = statusShorthands[taskInfo.id] || taskInfo.id; 

    // console.log('Tasking ' + creep.name + ' with "' + taskInfo.id + '"'); 
    creep.say(status); 
}

/**
 * @param {Creep} creep 
 */
Directive.getCreepTaskName = function(creep) 
{
    let info = creep.memory.task || {}; 
    return info.id; 
}

/**
 * @param {Creep} creep 
 */
Directive.getCreepTask = function(creep) 
{
    return creep.memory.task; 
}

/**
 * @param {Creep} creep 
 */
Directive.doesCreepHaveTask = function(creep) 
{
    return Directive.getCreepTaskName(creep) != null; 
}

/**
 * @param {Creep} creep 
 */
Directive.finishCreepTask = function(creep) 
{
    delete creep.memory.task; 
}

/**
 * @param {Room} room 
 * @param {string} role 
 */
Directive.forEachCreepOfRoomAndRole = function(room, role, func) 
{
    let creeps = Directive.ctor.getCreepsByHomeroomAndRole(room, role); 

    for (let i = 0; i < creeps.length; i++) 
    {
        let c = creeps[i]; 
        func(c, creeps); 
    }
}

/**
 * @param {Array<Creep>} creeps 
 * @param {Room} room 
 */
Directive.forEachCreep = function(creeps, func) 
{
    for (let i = 0; i < creeps.length; i++) 
    {
        let c = creeps[i]; 
        func(c, creeps); 
    }
}