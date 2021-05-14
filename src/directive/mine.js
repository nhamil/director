'use strict' 

const Directive = require('./directive'); 

const spawnQueue = require('../spawnqueue'); 
const util = require('../util'); 

class MineDirective extends Directive {

    run() {
        let room = this.room; 
        let creeps = this.getCreepsByHomeAndRole(room, 'miner'); 
        let sources = util.findSafeSources(room); 

        let minedSources = {}; 

        /** @type {Creep[]} */
        let idleMiners = []; 

        for (let c of creeps) {
            let task = this.getTask(c); 
            if (task) {
                if (task.id === 'mine') {
                    if (task.data.target) {
                        if (c.ticksToLive > 50) minedSources[task.data.target] = true; 
                    }
                    else {
                        // not valid target, reset 
                        this.removeTask(c); 
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
                if (Game.time % 100 === 0) this.log("Unmined: " + source.pos); 
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
                    idleMiners.splice(parseInt(index)); 

                    Memory.rooms[room.name] = Memory.rooms[room.name] || {}; 
                    let containers = Memory.rooms[room.name].sourceContainers; 
                    let pos = undefined; 
                    if (containers) {
                        pos = containers[source.id]; 
                    }
                    if (!pos) {
                        pos = util.getRoomPositionWriteData(source.pos); 
                    }

                    this.assignTask(creep, 'mine', {
                        target: source.id, 
                        pos: pos
                    }); 
                }
                else {
                    spawnQueue.request(room, 'miner', creeps.length === 0, spawnQueue.PRIORITY_MINER); 
                }
            }
        }
    }

}

module.exports = MineDirective; 