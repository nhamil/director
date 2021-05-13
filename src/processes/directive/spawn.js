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

    // TODO consider miners (and consider only 1400 ticks (to spawn more))
    printStats() {
        let room = this.room; 
        let terrain = room.getTerrain(); 
        let adjLifetime = CREEP_LIFE_TIME - 100; 

        this.log("Stats for " + room.name + ":"); 

        // energy per tick 
        let ept = 0; 
        let sources = util.findSafeSources(room); 
        ept += sources.length * 3000 / 300; 

        this.log(sources.length + " sources available"); 

        let minerCost = (BODYPART_COST[WORK] * 5 + BODYPART_COST[MOVE]) / adjLifetime; 
        this.log("- " + sources.length + " miners cost " + (minerCost * sources.length).toFixed(2)); 
        ept -= minerCost * sources.length; 
        
        let structures = room.find(FIND_STRUCTURES); 

        let storage = _.filter(structures, s => s.structureType === STRUCTURE_STORAGE)[0]; 
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
                let creepCostPerTick = (BODYPART_COST[CARRY] * carryPartsPerCreep + BODYPART_COST[MOVE] * Math.ceil(carryPartsPerCreep / 2)) / adjLifetime; 
                ept -= creepCostPerTick * numCreeps; 

                this.log("- Need " + numCreeps + " haulers, which cost a total " + (creepCostPerTick * numCreeps).toFixed(1) + " energy per tick"); 
            }
        }
        else {
            this.log("Storage does not exist yet, this part still needs to be implemented"); 
        }

        let roads = {
            count: 0, 
            plain: 0, 
            swamp: 0, 
            mul: 0, 
            cost: 0
        };
        let containers = {
            count: 0, 
            cost: 0
        }; 
        for (let s of structures) {
            switch (s.structureType) {
                case STRUCTURE_ROAD: 
                    if (terrain.get(s.pos.x, s.pos.y) === TERRAIN_MASK_SWAMP) {
                        roads.swamp++; 
                    }
                    else {
                        roads.plain++; 
                    }
                    break; 
                case STRUCTURE_CONTAINER: 
                    containers.count++; 
                    break; 
            }
        }

        // roads.plain += 100; 
        // roads.swamp += 100; 

        roads.count = roads.plain + roads.swamp; 
        roads.mul = roads.plain + roads.swamp * 5; 
        roads.cost = ROAD_DECAY_AMOUNT / ROAD_DECAY_TIME / REPAIR_POWER * roads.mul; 
        this.log(roads.count + " roads (" + (roads.swamp / roads.count * 100).toFixed(1) + "% swamp) cost " + roads.cost.toFixed(3) + " energy per tick"); 

        containers.cost = CONTAINER_DECAY / CONTAINER_DECAY_TIME_OWNED / REPAIR_POWER * containers.count; 
        this.log(containers.count + " containers cost " + containers.cost.toFixed(1) + " energy per tick"); 

        ept -= roads.cost + containers.cost; 

        // let towers = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER }); 
        // let estTowerCost = 1000 /* energy */ / 1000 /* ticks */; 
        // this.log("Tower cost is " + estTowerCost + ", resulting in " + (estTowerCost * towers.length) + " energy per tick for " + towers.length + " towers"); 
        // ept -= estTowerCost * towers.length; 

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