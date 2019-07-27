const dir = module.exports; 

let siteSort = 
{
    [STRUCTURE_CONTAINER]: 100, 
    [STRUCTURE_ROAD]: 10, 
    [STRUCTURE_EXTENSION]: 200, 
    [STRUCTURE_STORAGE]: 50, 
    [STRUCTURE_TOWER]: 70 
};

let getSiteImportance = function(type) 
{
    return siteSort[type] || 0; 
}

/**
 * @param {Room} room 
 */
dir.run = function(room) 
{
    handleSources(room); 
    handleExtensions(room); 
    if (room.controller.level > 1 && Game.time % 50 === 0) handleRoads(room); 
    handleStorage(room); 
    handleTower(room); 
    handleWalls(room); 
    handleBase(room); 

    Director.log('TODO handleNewRooms'); 
    handleNewRooms(room); 
    assignTasks(room); 
}

let handleNewRooms = function(room) 
{
    for (let name in Memory.needsSpawn) 
    {
        if (!Memory.needsSpawn[name]) continue; 
        
        Director.log('Attempting to send builder from ' + room.name + ' to ' + name); 

        let target = Game.rooms[name]; 

        if (target) 
        {
            let sites = _.filter(Game.constructionSites, s => s.room === target && s.structureType === STRUCTURE_SPAWN); 

            if (sites.length === 0) continue; 

            let targetCreeps = Director.getCreepsByHomeroom(target); 
            // targetCreeps = targetCreeps.concat(_.filter(Director.getCreepsByHomeroomAndRole(room, 'builder'), b => b.memory.task.target === sites[0].id))

            if (targetCreeps.length === 0) 
            {
                let idle = Director.getCreepsByHomeroomAndRoleWithoutTask(room, 'builder'); 
                idle = _.filter(idle, s => true); 

                if (idle.length === 0) 
                {
                    Director.log('Requesting new builder for target'); 
                    // Director.requestSpawn(room, 'builder', true, 20); 
                }
                else 
                {
                    Director.log('Sending idle builder to target (' + idle[0].name + ')'); 
                    // idle[0].memory.home = name; 
                    if (idle[0].carry.energy !== 0) {
                        Directive.assignTaskToCreep(idle[0], {
                            id: 'build', 
                            target: sites[0].id 
                        });
                    }
                }
            }
        }
    }
}

/**
 * @param {Room} room 
 */
let handleTower = function(room) 
{
    let rcl = room.controller.level; 
    let amount = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl]; 

    let towers = room.find(FIND_STRUCTURES, {
        filter: s => s.structureType == STRUCTURE_TOWER 
    }); 

    let spawns = room.find(FIND_MY_SPAWNS); 
    if (!spawns || spawns.length === 0) return; 

    let remaining = amount - towers.length; 

    while (remaining > 0) 
    {
        let pos = getParityPos(room, spawns[0].pos); 
        
        if (pos) 
        {
            pos.createConstructionSite(STRUCTURE_TOWER); 
        }

        remaining--; 
    }
}

/**
 * @param {Room} room 
 */
let handleStorage = function(room) 
{
    let rcl = room.controller.level; 

    if (rcl >= 4) 
    {
        if (!room.storage) 
        {
            // create construction site if it doens't exist 
            if (!_.find(room.find(FIND_CONSTRUCTION_SITES, s => s.structureType = STRUCTURE_STORAGE))) 
            {
                try {
                    let spawns = room.find(FIND_MY_SPAWNS); 
                    if (spawns && spawns.length > 0) 
                    {
                        let controller = room.controller; 
                        let spawn = spawns[0]; 
                        let path = PathFinder.search(controller.pos, spawn).path; 

                        let index = Math.min(path.length - 1, 4); 
                        let pos = path[index]; 

                        room.createConstructionSite(pos.x, pos.y, STRUCTURE_STORAGE); 
                    }
                } catch(e) 
                {
                    console.log(e); 
                } 
            }
        }
    }
}

/**
 * @param {Room} room 
 */
let handleExtensions = function(room) 
{
    let rcl = room.controller.level; 
    let totalExt = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][rcl]; 

    let exts = _.filter(Game.structures, s => s.room === room && s.structureType === STRUCTURE_EXTENSION); 
    let remaining = totalExt - exts.length; 

    if (!remaining) return; 

    Director.log('Remaining Extensions: ' + remaining); 

    let sites = _.filter(Game.constructionSites, s => s.structureType === STRUCTURE_EXTENSION && s.room === room); 

    let left = remaining - sites.length; 

    let spawn = _.filter(Game.spawns, s => s.room == room)[0]; 
    if (left)  
    {
        let pos = getParityPos(room, spawn.pos); 
        pos.createConstructionSite(STRUCTURE_EXTENSION); 
    }
}

/**
 * @param {Room} room 
 * @param {RoomPosition} startPos 
 * @returns {RoomPosition} 
 */
let getParityPos = function(room, startPos) 
{
    let radius = 1; 
    let parity = startPos.x + startPos.y; 

    let goodTerrain = 
    {
        plain: true, 
        swamp: true 
    };

    while (radius < 30) 
    {
        for (let y = startPos.y - radius; y <= startPos.y + radius; y++) 
        {
            if (y < 0 || y >= 50) continue; 
            for (let x = startPos.x - radius; x <= startPos.x + radius; x++) 
            {
                if ((x + y + parity) % 2 !== 0) continue; 
                if (x < 0 || x >= 50) continue; 

                let at = room.lookAt(x, y); 

                let valid = true; 
                for (let i in at) 
                {
                    let e = at[i]; 
                    if (e.structure && e.structure.structureType !== STRUCTURE_ROAD) { valid = false; break; } 
                    if (e.constructionSite) { valid = false; break; } 
                    if (e.terrain && !goodTerrain[e.terrain]) { valid = false; break; } 
                }

                if (valid) 
                {
                    // console.log('Adding extension at ' + x + ', ' + y + ', ' + room.name); 
                    return room.getPositionAt(x, y); 
                }
            }
        }

        radius++; 
    }
}

/**
 * @param {Room} room 
 */
let handleRoads = function(room) 
{
    let sites = _.filter(Game.constructionSites, s => s.room === room); 

    for (let y = 0; y < 50; y++) 
    {
        for (let x = 0; x < 50; x++) 
        {
            if (Travel.shouldPosHaveRoad(x, y, room.name)) 
            {
                let sList = room.lookForAt(LOOK_STRUCTURES, x, y); 
                let foundRoad = false; 
                for (let s of sList) 
                {
                    if (s.structureType === STRUCTURE_ROAD) 
                    {
                        foundRoad = true; 
                        break; 
                    }
                }

                if (!foundRoad && room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y).length === 0) 
                {
                    // console.log('Add road site at ' + x + ', ' + y); 
                    room.createConstructionSite(x, y, STRUCTURE_ROAD); 
                }
            } 
            else if (!Travel.shouldPosKeepRoad(x, y, room.name))
            {
                let sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y); 
                if (sites.length > 0 && sites[0].structureType === STRUCTURE_ROAD) 
                {
                    // console.log('Remove road site at ' + x + ', ' + y); 
                    sites[0].remove(); 
                }
            }
        }
    }
}

/**
 * @param {Room} room 
 */
let assignTasks = function(room) 
{
    let sites = _.filter(Game.constructionSites, s => s.room === room); 
    sites.sort((a, b) => getSiteImportance(b.structureType) - getSiteImportance(a.structureType)); 
    let target = sites[0]; 

    let builders = Director.getCreepsByHomeroomAndRole(room, ['builder', 'repairer']);
    let trueBuilders =  Director.getCreepsByHomeroomAndRole(room, ['builder']);

    // no build targets 
    if (target)  
    {
        Director.log('Build Target for ' + room.name + ': ' + target.structureType); 
        
        for (let i in builders) 
        {
            let c = builders[i]; 
            if (!Directive.doesCreepHaveTask(c)) 
            {
                if (c.carry.energy === 0) 
                {
                    Directive.assignTaskToCreep(c, {
                        id: 'withdraw', 
                    });
                }
                else 
                {
                    Directive.assignTaskToCreep(c, {
                        id: 'build', 
                        target: target.id 
                    });
                }
            }
        }
    }

    if (trueBuilders.length < Math.min(room.controller.level - 1, 2)) 
    {
        Director.requestSpawn(room, 'builder'); 
    }
}

/**
 * @param {Room} room 
 */
let handleSources = function(room) 
{
    let sources = room.find(FIND_SOURCES); 

    let mem = room.memory; 
    mem.sourceContainers = mem.sourceContainers || {}; 

    for (let i in sources) 
    {
        let source = sources[i]; 
        let posData = mem.sourceContainers[source.id]; 
        if (!posData) 
        {
            // no container or construction site, add one 
            let pos = chooseSourceContainerLocation(source); 

            if (pos) 
            {
                // console.log('Create source container construction site at ' + posData); 
                pos.createConstructionSite(STRUCTURE_CONTAINER); 
                mem.sourceContainers[source.id] = Util.getRoomPositionWriteData(pos, false); 
            }
        }
        else 
        {
            let pos = Util.getRoomPositionReadData(posData); 
            if (pos.findInRange(FIND_STRUCTURES, 0, { filter: s => s.structureType === STRUCTURE_CONTAINER }).length === 0) 
            {
                if (pos.findInRange(FIND_CONSTRUCTION_SITES, 0).length === 0) 
                {
                    // console.log('Create source container construction site at ' + posData); 
                    pos.createConstructionSite(STRUCTURE_CONTAINER); 
                }
            }
        }
    }
}

/**
 * @param {Source} source 
 */
let chooseSourceContainerLocation = function(source) 
{
    let controller = source.room.controller; 

    if (controller) 
    {
        let path = PathFinder.search(source.pos, controller.pos); 

        if (path && path.path && path.path.length > 0) 
        {
            return path.path[0]; 
        }
        else 
        {
            console.log('Could not find path from source to controller in room ' + source.room.name + '. This shouldn\'t be possible'); 
        }
    }
}

/**
 * @param {Room} room 
 */
let handleWalls = function(room) 
{
    Director.log('TODO handle walls'); 

    /** @type {any[]} */
    let exits = room.find(FIND_EXIT); 

    for (let i = 0; i < exits.length; i++) 
    {
        let pos = exits[i]; 
        // pos.x += 1; 
        room.visual.rect(pos.x - 0.5, pos.y - 0.5, 1, 1); 
    }
}

/**
 * @param {Room} room 
 */
let handleBase = function(room) 
{
    Director.log('TODO handle base ramparts'); 
}