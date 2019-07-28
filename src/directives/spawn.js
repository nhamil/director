'use strict' 

const dir = module.exports; 

/**
 * @param {Room} room 
 */
dir.run = function(room) {
    for (let name in Game.spawns) {
        let spawn = Game.spawns[name]; 
        if (spawn.room === room) {
            trySpawn(room, spawn); 
        }
    }
}

const trySpawn = function(room, spawn) {
    let request = Director.getSpawnRequestForRoom(room); 

    if (request) {
        let msg = 'Request to spawn "' + request.template + '"'; 
        if (request.now) msg += ' immediately'; 
        if (request.now) util.logRoom(room, msg); 

        let templateName = request.template; 
        let template = Director.templates.bodies[templateName]; 

        let energyAllowance = request.now ? room.energyAvailable : room.energyCapacityAvailable; 

        // TODO if no creeps to bring energy to extensions 
        //      use energyAvailable 

        if (template) {
            let build = Director.templates.createBody(energyAllowance, template); 

            if (build) {
                spawnCreep(spawn, room.name, template, build); 
            }
            else {
                util.logRoom(room, 'Template "' + templateName + '" did not provide a body, trying next request'); 
                trySpawn(room, spawn); 
            }
        }
        else {
            util.logRoom(room, 'Template "' + templateName + '" is invalid, trying next request'); 
            trySpawn(room, spawn); 
        }
    }
}

/**
 * @param {StructureSpawn} spawn 
 * @param {string} homeName 
 * @param {string} roleName 
 * @param {Array} build 
 */
const spawnCreep = function(spawn, homeName, template, build) {
    let name = util.getRandomName(template.shortName); 
    let res = spawn.spawnCreep(build, name, {
        memory: {
            template: template.name, 
            home: homeName 
        }
    });

    if (res === OK) 
    {
        console.log('Spawned ' + name + ' in room ' + homeName + ' (' + build + ')'); 
    }
    // else 
    // {
    //     console.log('Could not create ' + name + ': ' + res); 
    // }
}