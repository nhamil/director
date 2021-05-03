'use strict' 

const DirectiveProcess = require('./directive'); 
const spawnQueue = require('../../spawnqueue'); 

class MineDirectiveProcess extends DirectiveProcess {

    run() {
        let room = this.room; 
        let creeps = util.getCreepsByHomeroomAndRole(room, 'miner'); 
        let sources = room.find(FIND_SOURCES); 

        let minedSources = {}; 

        /** @type {Creep[]} */
        let idleMiners = []; 

        for (let c of creeps) {
            let task = util.getCreepTask(c); 

            if (task) {
                if (task.id === 'mine') {
                    if (task.target) {
                        if (c.ticksToLive > 50) minedSources[task.target] = true; 
                    }
                    else {
                        // not valid target, reset 
                        util.removeCreepTask(c); 
                        idleMiners.push(c); 
                    }
                }
                else {
                    this.log(`${c.name} should have a mining task but doesn't`); 
                }
            }
            else {
                idleMiners.push(c); 
            }
        }

        for (let i in sources) {
            let source = sources[i]; 

            if (!minedSources[source.id]) {
                // this.log(`Unmined source: ${source.pos}`); 
                let index = -1; 
                let bestDist = Infinity; 

                for (let j in idleMiners) {
                    let dist = idleMiners[j].pos.getRangeTo(source.pos); 

                    if (dist < bestDist) {
                        index = j; 
                        bestDist = dist; 
                    }
                }

                if (index !== -1) {
                    let creep = idleMiners[index]; 
                    idleMiners = idleMiners.splice(parseInt(index)); 

                    Memory.rooms[room.name] = Memory.rooms[room.name] || {}; 
                    let containers = Memory.rooms[room.name].sourceContainers; 
                    let pos = undefined; 
                    if (containers) {
                        pos = containers[source.id]; 
                    }
                    if (!pos) {
                        pos = util.getRoomPositionWriteData(source.pos); 
                    }

                    util.giveCreepTask(creep, 'mine', {
                        target: source.id, 
                        pos: pos
                    }); 
                }
                else {
                    spawnQueue.request(room, 'miner', creeps.length === 0, spawnQueue.HIGH_PRIORITY - 1); 
                }
            }
        }
    }

}

module.exports = MineDirectiveProcess; 