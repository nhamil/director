const dir = module.exports; 

/**
 * @param {Room} room 
 */
dir.run = function(room) 
{
    let creeps = Director.getCreepsByHomeroomAndRole(room, 'miner'); 
    let sources = room.find(FIND_SOURCES); 

    let minedSources = {}; 

    /** @type {Array<Creep>} */
    let idleMiners = []; 

    for (let c of creeps) 
    {
        let task = Directive.getCreepTask(c); 

        if (task) 
        {
            if (task.id === 'mine') 
            {
                if (task.target) 
                {
                    if (c.ticksToLive > 50) minedSources[task.target] = true; 
                }
                else 
                {
                    // not valid, reset 
                    Directive.finishCreepTask(c); 
                    idleMiners.push(c); 
                }
            }
            else 
            {
                console.log(c.name + ' should have a mining task but does\'t');
            }
        }
        else 
        {
            idleMiners.push(c); 
        }
    }

    for (let i in sources) 
    {
        let source = sources[i]; 

        if (!minedSources[source.id])  
        {
            // console.log('unmined source: ' + source.pos); 
            let index = -1; 
            let bestDist = Infinity; 

            for (let j in idleMiners) 
            {
                let dist = idleMiners[j].pos.getRangeTo(source.pos); 

                if (dist < bestDist) 
                {
                    index = j; 
                    bestDist = dist; 
                }
            }

            if (index !== -1) 
            {
                let creep = idleMiners[index]; 
                idleMiners = idleMiners.splice(parseInt(index)); 

                let containers = Memory.rooms[room.name].sourceContainers; 
                let pos = undefined; 
                if (containers) 
                {
                    pos = containers[source.id]; 
                }
                if (!pos) 
                {
                    pos = Util.getRoomPositionWriteData(source.pos); 
                }

                Directive.assignTaskToCreep(creep, {
                    id: 'mine', 
                    target: source.id, 
                    pos: pos  
                });
            }
            else 
            {
                Director.requestSpawn(room, 'miner', creeps.length === 0, 50); 
            }
        }
    }
}