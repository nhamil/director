const dir = module.exports; 

let findStructures = 
{
    [STRUCTURE_SPAWN]: 10, 
    [STRUCTURE_EXTENSION]: 20, 
    [STRUCTURE_TOWER]: 7, 
    [STRUCTURE_STORAGE]: 5 
};

/**
 * @param {Room} room 
 */
dir.run = function(room) 
{
    // if (!Director.isSpawnRequestedForRoom(room)) return; 

    let suppliers = Director.getCreepsByHomeroomAndRole(room, ['supplier', 'repairer']); 

    let targets = room.find(FIND_STRUCTURES, {
        filter: s => findStructures[s.structureType] && //console.log(s.structureType + ' ' + (s.energy < s.energyCapacity)) && 
            (((s.energy !== undefined) && (s.energy < s.energyCapacity)) || ((s.carry !== undefined) && (_.sum(s.carry) < s.carryCapacity)) || ((s.store && (_.sum(s.store) < s.storeCapacity))))  
    });
    
    // high comes first
    targets.sort((a, b) => findStructures[b.structureType] - findStructures[a.structureType]); 

    let longTermCount = 0; 
    let idleSuppliers = []; 
    for (let s of suppliers) 
    {
        if (s.ticksToLive > 100 && s.memory.role === 'supplier') longTermCount++; 

        if (!Directive.doesCreepHaveTask(s)) 
        {
            if (s.carry[RESOURCE_ENERGY] === 0) 
            {
                Directive.assignTaskToCreep(s, {
                    id: 'withdraw', 
                    noStorage: targets.length === 1 && targets[0].structureType === STRUCTURE_STORAGE
                }); 
            }
            else 
            {
                idleSuppliers.push(s); 
            }
        }
    }
 
    let targetLength = room.storage ? 2 : 1; 
    if (longTermCount < targetLength) 
    {
        Director.requestSpawn(room, 'supplier', suppliers.length === 0, suppliers.length === 0 ? 0 : 100); 
    }

    // console.log(targets.length); 

    let bad = 0; 
    while (idleSuppliers.length > 0 && targets.length > bad)  
    {
        bad = 0; 
        for (let target of targets) 
        {
            if (target.structureType === STRUCTURE_CONTAINER) 
            {
                let sources = target.pos.findInRange(FIND_SOURCES, 1); 
                if (sources && sources.length > 0) continue; 
            }

            let index = Util.getIndexOfClosestCreep(idleSuppliers, target); 

            if (index !== -1) 
            {
                let c = idleSuppliers[index];
                Directive.assignTaskToCreep(c, {
                    id: 'supply', 
                    target: target.id 
                }); 
                // Director.log(c.pos + ' -> ' + target.pos); 

                idleSuppliers.splice(index, 1); 
            }
            else 
            {
                bad++; 
                // console.log('bad: ' + target.structureType); 
            }
        }
    }
}