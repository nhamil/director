'use strict' 

const log = require('../log'); 
const template = require('../template'); 
const util = require('../util'); 
const Directive = require('./directive'); 

class SpawnDirective extends Directive {

    postFrame() {
        let spawns = this.room.find(FIND_MY_SPAWNS); 

        for (let i in spawns) {
            this.trySpawn(spawns[i]); 
        }
    }

    /**
     * @param {StructureSpawn} spawn 
     */
    trySpawn(spawn) {
        let request = this.getSpawnRequest(); 

        if (request) {
            let msg = `Request to spawn "${request.templateName}`; 
            if (request.now) {
                msg += ' immediately'; 
            }
            log.writeRoom(this.room, msg); 

            let templateName = request.templateName; 
            let type = template.bodies[templateName]; 

            let energyAllowance = request.now ? this.room.energyAvailable : this.room.energyCapacityAvailable; 

            // TODO if no creeps to bring energy to extensions 
            //      use energyAvailable 

            if (type) {
                let build = template.createBody(energyAllowance, type); 

                if (build && build.length) {
                    this.spawnCreep(spawn, this.room.name, type, build); 
                }
                else {
                    log.writeRoom(this.room, 'Template "' + templateName + '" did not provide a body, trying next request'); 
                    this.trySpawn(spawn); 
                }
            }
            else {
                log.writeRoom(this.room, 'Template "' + templateName + '" is invalid, trying next request'); 
                this.trySpawn(spawn); 
            }
        }
    }

    /**
     * @param {StructureSpawn} spawn 
     * @param {BodyTemplate} type 
     */
    spawnCreep(spawn, homeName, type, build) {
        let name = util.randomName(type.shortName); 

        let res = spawn.spawnCreep(build, name, {
            memory: {
                template: type.name, 
                home: homeName 
            }
        });

        if (res === OK) {
            log.writeRoom(this.room, 'Spawned ' + name + ' (' + build + ')'); 
        }
    }

}

module.exports = SpawnDirective; 
