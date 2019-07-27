const task = module.exports; 

/**
 * @param {Creep} creep 
 */
task.run = function(creep, data) 
{
    let flagId = data.target; 
    if (!flagId) 
    {
        console.log(creep.name + ' has no flag target, quitting: ' + JSON.stringify(data.target)); 
        return true; 
    }

    let flag = Game.flags[flagId]; 
    if (!flag) 
    {
        console.log(creep.name + ' has invalid flag id, quitting'); 
        return true; 
    }

    if (creep.room === flag.room) 
    {
        return claimController(creep, flag); 
    }
    else 
    {
        creep.moveTo(flag); 
    }
}

/** @param {Creep} creep */
let claimController = function(creep, flag) 
{
    let controller = creep.room.controller; 

    if (!controller) 
    {
        console.log(creep.name + ' was given a claim room without a controller, quitting'); 
        return true; 
    }

    let err = creep.claimController(controller); 
    if (err !== OK) 
    {
        // console.log(err); 
        creep.moveTo(controller); 
    }
    else 
    {
        let msg = creep.name + ' successfully claimed room ' + creep.room.name; 
        console.log(msg); 
        Game.notify(msg); 

        let rn = creep.room.name; 
        let mem = Memory.rooms[rn] = Memory.rooms[rn] || {}; 

        mem.requestSpawn = Util.getRoomPositionWriteData(flag.pos); 

        return true; 
    }
}