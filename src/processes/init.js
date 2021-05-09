'use strict'; 

const Process = require('../os/process'); 

class InitProcess extends Process {

    get priority() {
        return PRIORITY_LOWEST + 1; 
    }

    create(args) {}

    reload() {}

    run() {
        // this.startChildIfNotExist('roomeval', 'roomeval'); 

        for (let creep in Memory.creeps) {
            let c = Game.creeps[creep]; 
            if (!c) {
                delete Memory.creeps[creep]; 
            } 
            else if (util.doesCreepHaveTask(c)) {
                let task = util.getCreepTask(c); 
                let pidName = `${creep}.task.${task.id}`; 
                if (kernel.getPidByName(pidName) === PID_NONE) {
                    this.startChild(`task.${task.id}`, pidName, {
                        creep: c.name 
                    }); 
                }
            }
            else {
                // this.log(`${creep} does not have task`); 
            }
        }

        // create owned room processes 
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName]; 
            if (room.controller && room.controller.my) {
                let roomProcName = `${roomName}.colony`; 
                this.startChildIfNotExist('colony', roomProcName, {
                    room: roomName
                }); 
            }
        }
    }

}

module.exports = InitProcess; 