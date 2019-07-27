const dir = module.exports; 

/**
 * @param {Room} room 
 */
dir.run = function(room) 
{
    for (let spawnName in Game.spawns) 
    {
        let spawn = Game.spawns[spawnName]; 
        if (spawn.room !== room) continue; 

        trySpawn(room, spawn); 
    }
}

let trySpawn = function(room, spawn) 
{
    let request = Director.getSpawnRequestForRoom(room); 

    if (request) 
    {
        let msg = 'Request to spawn "' + request.role + '" for room ' + request.room; 
        if (request.now) msg += ' immediately'; 
        Director.log(msg); 
    
        let roleName = request.role; 
        let role = Director.roles[roleName]; 

        let energyAllowance = request.now ? room.energyAvailable : room.energyCapacityAvailable; 

        if (Director.getCreepsByHomeroomAndRole(room, 'supplier').length === 0) 
        {
            energyAllowance = room.energyAvailable; 
        }

        if (role) 
        {
            let build = role.getBuild(energyAllowance); 
            if (build) 
            {
                spawnCreep(spawn, room.name, roleName, build); 
            }
            else 
            {
                console.log('Role "' + roleName + '" did not provide a build, trying next request'); 
                trySpawn(room, spawn); 
            }
        }
        else 
        {
            console.log('Unknown role "' + roleName + '", cannot spawn'); 
        }
    }
}

/**
 * @param {StructureSpawn} spawn 
 * @param {string} homeName 
 * @param {string} roleName 
 * @param {Array} build 
 */
let spawnCreep = function(spawn, homeName, roleName, build) 
{
    let name = Util.randomName(roleName); 
    let res = spawn.spawnCreep(build, name, {
        memory: {
            role: roleName, 
            home: homeName 
        }
    });

    if (res === OK) 
    {
        console.log('Spawned ' + name + ' in room ' + homeName + ' (' + build + ')'); 
    }
    // else 
    // {
    //     console.log('Could not create ' + roleName); 
    // }
}