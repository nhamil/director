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

    run() {
        let room = Game.rooms[this.data.room]; 

        if (room && room.controller && room.controller.my) {
            let spawns = room.find(FIND_MY_SPAWNS); 

            if (spawns.length > 0) {
                let spawn = spawns[0]; 
                let req = spawnQueue.getRequestForRoom(room); 
                if (req) {
                    let body = role.build(req.role, spawn.store.energy); 
                    if (!body) {
                        this.log("Invalid role: " + req.role); 
                    }
                    if (body && util.getBodyCost(body) <= spawn.store.energy) {
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