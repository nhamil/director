'use strict' 

const creeps = require('../creeps'); 
const priority = require('../priority'); 
const roles = require('../roles'); 
const spawn = require('../spawn'); 

const RoomDirective = require('./RoomDirective'); 

const MineTask = require('../tasks/MineTask'); 

const log = require('../log').createLogger('MineDirective'); 

class MineDirective extends RoomDirective {

    constructor() {
        super('mine'); 
        
        this.rooms = {}; 
    }

    preUpdateRoom(room, data) {
        let miners = creeps.getCreepsByRole(room, roles.miner); 
        let tasked = creeps.getCreepsByTask(room, MineTask.name); 

        let sources = room.find(FIND_SOURCES); 

        data.unmined = []; 
        for (let source of sources) {
            let found = false; 
            for (let miner of tasked) {
                if (miner.memory.data.target === source.id) {
                    found = true; 
                    break; 
                }
            }
            if (!found) {
                data.unmined.push(source); 
            }
        }

        // TODO number of sources 
        // if (miners.length < sources.length) {
        //     spawn.addRequest(room, roles.miner, {
        //         priority: priority.HIGH 
        //     })
        // }
    }

    updateRoom(room, data) {
        let miners = creeps.getIdleCreepsByRole(room, roles.miner); 

        for (let source of data.unmined) {
            if (miners.length) {
                let miner = miners.shift(); 

                MineTask.assign(miner, source); 
            }
        }
    }

}

module.exports = MineDirective; 
