'use strict' 

global.util = module.exports; 

Memory.rooms = Memory.rooms || {}; 
Memory.creeps = Memory.creeps || {}; 
Memory.flags = Memory.flags || {}; 
Memory.spawns = Memory.spawns || {}; 
Memory.expandFlags = Memory.expandFlags || {};
Memory.needsSpawn = Memory.needsSpawn || {}; 

/**
 * @param {Array} build
 */
util.getBodyCost = function(build) 
{
    let sum = 0; 

    for (let i = 0; i < build.length; i++) 
    {
        sum += BODYPART_COST[build[i]]; 
    }

    return sum; 
}

// util.creepIsRole = function(role) 
// {
//     return c => c.memory.role === role; 
// }

util.randomName = function(base) 
{
    return base + (Math.floor(Math.random() * 100000) + '').padStart(5, '0'); 
}

util.getIndexOfClosestCreep = function(creeps, target) 
{
    let best = Infinity; 
    let index = -1; 

    for (let i = 0; i < creeps.length; i++) 
    {
        let dist = creeps[i].pos.getRangeTo(target); 
        if (dist < best) 
        {
            index = i; 
            best = dist; 
        }
    }

    return index; 
}

/**
 * @param {string} memData 
 * @param {string} roomName 
 */
util.getRoomPositionReadData = function(memData, roomName) 
{
    if (typeof(memData) !== 'string') return; 
    let out = memData.split(','); 
    try 
    {
        return new RoomPosition(parseInt(out[0]), parseInt(out[1]), roomName || out[2]); 
    }
    catch (e) { return; }
}

/**
 * @param {RoomPosition} pos 
 */
util.getRoomPositionWriteData = function(pos) 
{
    return pos.x + ',' + pos.y + ',' + pos.roomName;
}

/**
 * @param {RoomPosition} a 
 * @param {RoomPosition} b
 */
util.arePositionsEqual = function(a, b) 
{
    return a.x == b.x && a.y == b.y && a.roomName == b.roomName; 
}

/**
 * @param {RoomPosition} pos 
 */
util.createModifiablePos = function(pos) 
{
    return { x: pos.x, y: pos.y, roomName: pos.roomName }; 
}

util.getDate = function() 
{
    let offset = -4;
    return new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace('GMT', 'EST' ); 
}

/**
 * @param {Creep} creep 
 * @returns {Task} Creep task information
 */
util.getCreepTask = function(creep) {
    if (util.doesCreepHaveTask(creep)) {
        return creep.memory.task; 
    }
    else {
        return null; 
    }
}

/**
 * @param {Creep} creep 
 * @param {string} task 
 * @param {Object} data 
 */
util.giveCreepTask = function(creep, task, data = {}) {
    let taskData = {}; 

    for (let i in data) {
        taskData[i] = data[i]; 
    }

    taskData.id = task; 
    creep.memory.task = taskData; 
}

/**
 * @param {Creep} creep 
 * @returns {boolean}
 */
util.doesCreepHaveTask = function(creep) {
    return !!creep.memory.task
}

/**
 * @param {Creep} creep 
 */
util.removeCreepTask = function(creep) {
    delete creep.memory.task; 
    delete creep.memory.action; 
}

/**
 * @param {Creep} creep 
 * @returns {Action} Creep action information
 */
util.getCreepAction = function(creep) {
    if (util.doesCreepHaveAction(creep)) {
        return creep.memory.action; 
    }
    else {
        return null; 
    }
}

/**
 * @param {Creep} creep 
 * @param {string} action 
 * @param {Object} data 
 */
 util.giveCreepAction = function(creep, action, data = {}) {
    let actionData = {}; 

    for (let i in data) {
        actionData[i] = data[i]; 
    }

    actionData.id = action; 
    creep.memory.action = actionData; 
}

/**
 * @param {Creep} creep 
 * @returns {boolean}
 */
util.doesCreepHaveAction = function(creep) {
    return !!creep.memory.action
}

/**
 * @param {Creep} creep 
 */
util.removeCreepAction = function(creep) {
    delete creep.memory.action; 
}

/**
 * @param {Room} room 
 * @param {string|string[]} role 
 * @returns {Creep[]} 
 */
util.getCreepsByHomeroomAndRole = function(room, role) 
{
    let roles = {}; 
    if (typeof(role) === 'string') 
    {
        roles[role] = true; 
    }
    else 
    {
        for (let i in role) roles[role[i]] = true; 
    }

    return _.filter(Game.creeps, c => c.memory.home === room.name && roles[c.memory.role]); 
}

/**
 * @param {Room} room 
 * @param {string|string[]} role 
 * @returns {Creep[]} 
 */
util.getCreepsByHomeroomAndRoleWithoutTask = function(room, role) 
{
    let roles = {}; 
    if (typeof(role) === 'string') 
    {
        roles[role] = true; 
    }
    else 
    {
        for (let i in role) roles[role[i]] = true; 
    }

    return _.filter(Game.creeps, c => c.memory.home === room.name && roles[c.memory.role] && !c.memory.task); 
}

// util.expandToFlagFromRoom = function(flagName, roomName, expand=true) 
// {
//     let flag = Game.flags[flagName]; 

//     if (expand && flag) 
//     {
//         Memory.expandFlags[flagName] = { from: roomName }; 
//         return true; 
//     }

//     if (!expand) 
//     {
//         delete Memory.expandFlags[flagName]; 
//     }

//     return false; 
// }

// util.doOrMoveTo = function(creep, target, action, opts={}) 
// {
//     opts.ok = opts.ok || [OK]; 

//     let status = 0; 
//     if (opts.arg === undefined) 
//     {
//         status = creep[action](target);
//     }
//     else 
//     {
//         status = creep[action](target, opts.arg);  
//     }

//     if (opts.ok.indexOf(status) === -1) 
//     {
//         creep.moveTo(target); 
//     }
// }