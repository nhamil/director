const dir = module.exports; 

// TODO check CCL do know if towers are considering repairs 

let wallStrength = 
{
    1: 1, 
    2: 100, 
    3: 1000, 
    4: 1000, 
    5: 1000, 
    6: 1000, 
    7: 1000, 
    8: 1000
};

/**
 * @param {Room} room 
 */
dir.run = function(room) 
{
    let rcl = room.controller.level; 
    let sites = _.filter(room.find(FIND_STRUCTURES), s => s.hits !== undefined && (
        s.structureType !== STRUCTURE_ROAD || Travel.shouldPosKeepRoad(s.pos.x, s.pos.y, s.pos.roomName) && (
            s.structureType !== STRUCTURE_WALL || s.hits < wallStrength[rcl]
        )
    )); 
    sites.sort((a, b) => {
        let B = b.hits/b.hitsMax; 
        let A = a.hits/a.hitsMax; 
        return A < B ? -1 : 1; 
    }); 
    let target = sites[0]; 

    let builders = Director.getCreepsByHomeroomAndRole(room, ['repairer']); 

    // no build targets 
    if (target && target.hits !== target.hitsMax)  
    {
        Director.log('Repair Target for ' + room.name + ': ' + target.structureType); 
        
        let towers = room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_TOWER && s.energy !== 0 
        }); 

        let enemies = room.find(FIND_CREEPS, {
            filter: c => !c.my
        }); 

        // TODO make sure not in combat 
        // TODO different target for each entity 
        if (towers.length > 0 && enemies.length === 0) 
        {
            for (let i in towers) 
            {
                let t = sites[i]; 
                if (t) towers[i].repair(t); 
            }
        }
        else 
        {
            for (let i in builders) 
            {
                let c = builders[i]; 
                let t = sites[i]; 
                if (!Directive.doesCreepHaveTask(c)) 
                {
                    if (c.carry.energy === 0) 
                    {
                        Directive.assignTaskToCreep(c, {
                            id: 'withdraw', 
                        });
                    }
                    else if (t) 
                    {
                        Directive.assignTaskToCreep(c, {
                            id: 'repair', 
                            target: t.id 
                        });
                    }
                }
            }
        }
    }

    if (builders.length < Math.min(2, room.controller.level))
    {
        Director.requestSpawn(room, 'repairer'); 
    }
}
