const task = module.exports; 

let findStructures = 
{
    [STRUCTURE_CONTAINER]: true, 
    [STRUCTURE_STORAGE]: true
};

/**
 * @param {Creep} creep 
 */
task.run = function(creep, data)  
{
    if (data.noStorage) 
    {
        findStructures[STRUCTURE_STORAGE] = false; 
    }
    else 
    {
        findStructures[STRUCTURE_STORAGE] = true; 
    }

    let target = Game.getObjectById(data.targetId); 
    let type = data.targetType; 

    let found = false; // TODO CHANGE 

    let remaining = creep.carryCapacity - _.sum(creep.carry);  

    if (target && type) 
    {
        if (type === 'dropped') 
        {
            if (target.amount > remaining) 
            {
                Util.doOrMoveTo(creep, target, 'pickup'); 
                found = true; 
            }
        }
        else if (type === 'structure') 
        {
            if (target.store[RESOURCE_ENERGY] > remaining) 
            {
                Util.doOrMoveTo(creep, target, 'withdraw', {
                    arg: RESOURCE_ENERGY 
                }); 
                found = true; 
            }
        }
    }

    if (!found) 
    {
        if (data.dontPrioritizePickup || !pickupGroundEnergy(creep, data)) 
        {
            if (!withdrawFromStructure(creep, data) && !pickupGroundEnergy(creep, data)) 
            {
                harvestFromSource(creep, data); 
            }
        }
    }

    return _.sum(creep.carry) == creep.carryCapacity;  
}

/** 
 * @param {Creep} c
 * */
let pickupGroundEnergy = function(c, data) 
{
    let remaining = c.carryCapacity - _.sum(c.carry);  
    let target = c.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > remaining 
    }); 

    // console.log('dropped: ' + target); 

    if (target) 
    {
        Util.doOrMoveTo(c, target, 'pickup'); 
        data.targetId = target.id; 
        data.targetType = 'dropped'; 

        return true; 
    }
}

/**
 * @param {Creep} c 
 */
let withdrawFromStructure = function(c, data) 
{
    let remaining = c.carryCapacity - _.sum(c.carry);  
    let target = c.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => findStructures[s.structureType] && s.store[RESOURCE_ENERGY] > remaining
    });

    if (target) 
    {
        Util.doOrMoveTo(c, target, 'withdraw', {
            arg: RESOURCE_ENERGY 
        }); 
        data.targetId = target.id; 
        data.targetType = 'structure'; 
        return true; 
    }
}

/**
 * @param {Creep} c 
 */
let harvestFromSource = function(c, data) 
{
    let target = c.pos.findClosestByPath(FIND_SOURCES_ACTIVE); 

    if (target) 
    {
        Util.doOrMoveTo(c, target, 'harvest'); 
        delete data.targetId; 
        delete data.targetType; 
        return true; 
    }
}