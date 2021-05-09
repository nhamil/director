'use strict' 

const DirectiveProcess = require('./directive'); 
const spawnQueue = require('../../spawnqueue'); 

const structurePriority = {
    [STRUCTURE_SPAWN]: 1, 
    [STRUCTURE_EXTENSION]: 1, 
    [STRUCTURE_TOWER]: 2, 
    [STRUCTURE_STORAGE]: 3 
}

class HaulDirectiveProcess extends DirectiveProcess {

    run() {
        let room = this.room;
        let creeps = util.getCreepsByHomeroomAndRole(room, ['hauler', 'repairer']); 

        // let idleWithoutEnergy = creeps.filter(i => !util.doesCreepHaveTask(i) && i.store.energy === 0); 
        let idleWithEnergy = creeps.filter(i => !util.doesCreepHaveTask(i) && i.store.energy === 0); 

        let numTrueHaulers = 0; 

        let targets = room.find(FIND_STRUCTURES, {
            filter: s => structurePriority[s.structureType] && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
        targets.sort((a, b) => structurePriority[a] - structurePriority[b]); 

        for (let creep of creeps) {
            if (creep.ticksToLive > 100 && util.getCreepRole(creep) == 'hauler') {
                numTrueHaulers++; 
            }

            if (creep.store.energy === 0) {
                util.giveCreepTask(creep, 'withdraw'); 
            }
            else {
                let targetIndex = util.findIndexOfClosestObject(creep, targets); 

                if (targetIndex !== -1) {
                    util.giveCreepTask(creep, 'haul', {
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

module.exports = HaulDirectiveProcess; 