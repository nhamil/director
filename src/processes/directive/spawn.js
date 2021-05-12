'use strict' 

const DirectiveProcess = require('./directive'); 
const spawnQueue = require('../../spawnqueue'); 
const role = require('../../role'); 

class SpawnRoomProcess extends DirectiveProcess {

    get important() {
        return true; 
    }

    get priority() {
        return PRIORITY_LOWEST; 
    }

    printStats() {
        let room = this.room; 

        this.log("Stats for " + room.name + ":"); 

        // energy per tick 
        let ept = 0; 
        let sources = util.findSafeSources(room); 
        ept += sources.length * 3000 / 300; 

        this.log(sources.length + " sources available"); 
        
        let storage = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_STORAGE })[0]; 
        if (storage) {
            for (let source of sources) {
                // assumes roads for now 
                let roadMul = 0.5; 

                let path = PathFinder.search(storage.pos, { pos: source.pos, range: 1 }); 

                let tiles = path.path.length * 3; // over estimate  
                let tripsPerRegen = 300 / tiles; 
                this.log("- Length of full path from storage to source at " + source.pos + " takes " + tiles + " ticks resulting in " + tripsPerRegen.toFixed(1) + " trips per regen"); 
                let energyPerTrip = 3000 / tripsPerRegen; 
                let carryParts = Math.ceil(energyPerTrip / 50); 
                this.log("- Hauler must carry " + energyPerTrip.toFixed(1) + " energy each trip, resulting in " + carryParts + " carry parts"); 

                let availableEnergy = room.energyCapacityAvailable; 
                let carryPartsPerCreep = Math.min(carryParts, Math.floor(availableEnergy / (BODYPART_COST[CARRY] + roadMul * BODYPART_COST[MOVE]))); 
                let numCreeps = Math.ceil(carryParts / carryPartsPerCreep); 
                let creepCostPerTick = (BODYPART_COST[CARRY] * carryPartsPerCreep + BODYPART_COST[MOVE] * Math.ceil(carryPartsPerCreep / 2)) / 1500; 
                ept -= creepCostPerTick * numCreeps; 

                this.log("- Need " + numCreeps + " haulers, which cost a total " + (creepCostPerTick * numCreeps).toFixed(1) + " energy per tick"); 
            }
        }
        else {
            this.log("Storage does not exist yet, this part still needs to be implemented"); 
        }

        let towers = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER }); 
        let estTowerCost = 1000 /* energy */ / 1000 /* ticks */; 
        this.log("Tower cost is " + estTowerCost + ", resulting in " + (estTowerCost * towers.length) + " energy per tick for " + towers.length + " towers"); 
        ept -= estTowerCost * towers.length; 

        this.log(ept.toFixed(1) + " net energy income per tick possible"); 
    }

    run() {
        let room = Game.rooms[this.data.room]; 

        // if (Game.time % 100 === 0) this.printStats(); 

        if (room && room.controller && room.controller.my) {
            let spawns = room.find(FIND_MY_SPAWNS); 

            let hasHaulers = util.getCreepsByHomeroomAndRole(room, 'hauler').length > 0; 

            if (spawns.length > 0) {
                let spawn = spawns[0]; 
                let req = spawnQueue.getRequestForRoom(room); 
                if (req) {
                    let body = role.build(req.role, (req.needNow || !hasHaulers) ? room.energyAvailable : room.energyCapacityAvailable); 
                    if (!body) {
                        this.log("Invalid role: " + req.role); 
                    }
                    if (body && util.getBodyCost(body) <= room.energyAvailable) {
                        let name = util.randomName(role.initial(req.role)); 
                        if (spawn.spawnCreep(body, name, {
                            memory: {
                                home: req.room, 
                                role: req.role 
                            } 
                        }) == OK) {
                            this.log("Spawning " + name + " with " + body); 
                        }
                    }
                } 
            }
        }
        else {
            this.log(`Room no longer needs spawning`); 
            return this.kill(); 
        }
    }

}

module.exports = SpawnRoomProcess; 