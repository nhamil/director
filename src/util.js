global.Util = module.exports; 

Memory.rooms = Memory.rooms || {}; 
Memory.creeps = Memory.creeps || {}; 
Memory.flags = Memory.flags || {}; 
Memory.spawns = Memory.spawns || {}; 
Memory.expandFlags = Memory.expandFlags || {};
Memory.needsSpawn = Memory.needsSpawn || {}; 

/**
 * @param {Array} build
 */
Util.getBodyCost = function(build) 
{
    let sum = 0; 

    for (let i = 0; i < build.length; i++) 
    {
        sum += BODYPART_COST[build[i]]; 
    }

    return sum; 
}

Util.creepIsRole = function(role) 
{
    return c => c.memory.role === role; 
}

Util.randomName = function(base) 
{
    return base + Math.floor(Math.random() * 100000); 
}

Util.getIndexOfClosestCreep = function(creeps, target) 
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
Util.getRoomPositionReadData = function(memData, roomName) 
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
Util.getRoomPositionWriteData = function(pos) 
{
    return pos.x + ',' + pos.y + ',' + pos.roomName;
}

/**
 * @param {RoomPosition} a 
 * @param {RoomPosition} b
 */
Util.arePositionsEqual = function(a, b) 
{
    return a.x == b.x && a.y == b.y && a.roomName == b.roomName; 
}

/**
 * @param {RoomPosition} pos 
 */
Util.createModifiablePos = function(pos) 
{
    return { x: pos.x, y: pos.y, roomName: pos.roomName }; 
}

Util.getDate = function() 
{
    let offset = -5;
    return new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace('GMT', 'CST' ); 
}

Util.expandToFlagFromRoom = function(flagName, roomName, expand=true) 
{
    let flag = Game.flags[flagName]; 

    if (expand && flag) 
    {
        Memory.expandFlags[flagName] = { from: roomName }; 
        return true; 
    }

    if (!expand) 
    {
        delete Memory.expandFlags[flagName]; 
    }

    return false; 
}

Util.doOrMoveTo = function(creep, target, action, opts={}) 
{
    opts.ok = opts.ok || [OK]; 

    let status = 0; 
    if (opts.arg === undefined) 
    {
        status = creep[action](target);
    }
    else 
    {
        status = creep[action](target, opts.arg);  
    }

    if (opts.ok.indexOf(status) === -1) 
    {
        creep.moveTo(target); 
    }
}