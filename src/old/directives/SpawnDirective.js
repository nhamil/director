'use strict' 

const priority = require('../priority'); 
const spawn = require('../spawn'); 

const RoomDirective = require('./RoomDirective'); 

const log = require('../log').createLogger('SpawnDirective'); 

class SpawnDirective extends RoomDirective {

    constructor() {
        super('spawn'); 
    }

    get priority() {
        return priority.TRIVIAL; 
    }

    /**
     * @param {Room} room 
     */
    postUpdateRoom(room) {
        for (let s of room.find(FIND_MY_SPAWNS)) {
            if (!s.spawning) this.trySpawn(s); 
        }
    }

    /**
     * @param {StructureSpawn} spawner 
     */
    trySpawn(spawner) {
        let req = spawn.getRequest(spawner.room); 
        let room = spawner.room; 

        if (req) {
            let role = req.role; 

            if (role) {
                log.debug('Got request to spawn ' + req.role.name); 

                let energy = req.now ? room.energyAvailable : room.energyCapacityAvailable; 
                let build = role.createBody(energy); 

                if (build && build.length) {
                    log.debug('Creep build: ' + build); 
                    
                    let name = role.shortName + '_' + Math.floor(Math.random() * 65536).toString(16); 
                    let res = spawner.spawnCreep(build, name, {dryRun: true}); 
                    if (res === OK) {
                        this.spawnCreep(spawner, name, role.name, build); 
                    }
                }
                else {
                    log.warn('Invalid build for ' + role.name + ', trying next request'); 
                    this.trySpawn(spawner); 
                }
            }
            else {
                log.warn('Spawn request does not have a role, trying next request'); 
                this.trySpawn(spawner); 
            }
        }
    }

    /**
     * 
     * @param {StructureSpawn} spawner 
     * @param {Role} role 
     * @param {BodyPartConstant[]} build 
     */
    spawnCreep(spawner, name, roleName, build) {
        let res = spawner.spawnCreep(build, name, {
            memory: {
                home: spawner.room.name, 
                role: roleName 
            }
        });

        if (res === OK) {
            log.info('Spawned ' + name + ' in ' + spawner.room.name); 
        }
        else {
            log.warn('Creep spawn failed: ' + res); 
        }
    }

}

module.exports = SpawnDirective; 
