'use strict' 

const Directive = require('./directive'); 
const spawnQueue = require('../../spawnqueue'); 
const util = require('../util'); 

const structurePriority = {
    [STRUCTURE_SPAWN]: 1, 
    [STRUCTURE_EXTENSION]: 1, 
    [STRUCTURE_TOWER]: 2, 
    [STRUCTURE_STORAGE]: 3 
}

class HaulDirective extends Directive {

    run() {
        let room = this.room;
        let creeps = this.getCreepsByHomeAndRole(room, ['hauler']); 

        // let idleWithoutEnergy = creeps.filter(i => !util.doesCreepHaveTask(i) && i.store.energy === 0); 
        let idleWithEnergy = creeps.filter(i => !this.hasTask(i) && i.store.energy === 0); 

        let numTrueHaulers = 0; 

        let targets = room.find(FIND_STRUCTURES, {
            filter: s => structurePriority[s.structureType] && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
        targets.sort((a, b) => structurePriority[a.structureType] - structurePriority[b.structureType]); 

        if (targets.length > 0) {
            let pri = structurePriority[targets[0].structureType]; 
            // if (Game.time % 50 === 0) this.log(pri + " " + targets[0]); 
            targets = targets.filter(i => structurePriority[i.structureType] === pri); 
        }
        
        for (let creep of creeps) {
            if (creep.ticksToLive > 100 && this.getRole(creep) === 'hauler') {
                numTrueHaulers++; 
            }

            if (this.hasTask(creep)) continue; 

            // if (creep.store.energy === 0) {
            //     util.giveCreepTask(creep, 'withdraw'); 
            // }
            // else 
            {
                let targetIndex = util.findIndexOfClosestObject(creep, targets); 

                if (targetIndex !== -1) {
                    this.assignTask(creep, 'haul', {
                        target: targets[targetIndex].id
                    }); 

                    if (targets[targetIndex].store.getFreeCapacity(RESOURCE_ENERGY) <= creep.store.energy) {
                        targets.splice(targetIndex); 
                    }
                }
            }
        }

        if (numTrueHaulers < 2) {
            spawnQueue.request(room, 'hauler', numTrueHaulers === 0, spawnQueue.HIGH_PRIORITY); 
        }
    }

}

module.exports = HaulDirective; 