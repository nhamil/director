const dir = module.exports; 

/**
 * @param {Room} room 
 */
dir.run = function(room) 
{
    // Director.log('TODO directive.claim returns immediately'); 
    // return; 

    for (let name in Memory.expandFlags) 
    {
        let request = Memory.expandFlags[name]; 
        if (request && request.from === room.name && Game.flags[name]) 
        {
            let f = Game.flags[name]; 
            let r = Game.rooms[f.pos.roomName]; 
            if (r && r.controller && r.controller.my)
            {
                // continue 
                
                r.createConstructionSite(f.pos.x, f.pos.y, STRUCTURE_SPAWN); 
            }
            else 
            {
                let creeps = Director.getCreepsByHomeroomAndRole(room, 'claimer'); 
                let forFlag = _.filter(creeps, c => c.memory && c.memory.task && c.memory.task.id === 'claim' && c.memory.task.target === name); 
                
                if (forFlag.length === 0)  
                {
                    // console.log('Try to assign claimer'); 
                    expandToFlag(room, Game.flags[name]); 
                    break; 
                }
            }
        }
    }
}

let expandToFlag = function(room, flag) 
{
    Director.log('Trying to expand to ' + flag.pos.roomName + ' from ' + room.name); 

    let claimers = Director.getCreepsByHomeroomAndRoleWithoutTask(room, 'claimer'); 

    if (claimers.length === 0) 
    {
        Director.requestSpawn(room, 'claimer'); 
    }
    else 
    {
        let claimer = claimers[0]; 

        Directive.assignTaskToCreep(claimer, {
            id: 'claim', 
            target: flag.name 
        }); 
    }
}