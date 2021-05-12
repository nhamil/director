'use strict' 

const TaskProcess = require('./task'); 

class UpgradeTaskProcess extends TaskProcess {

    runTask() {
        let creep = this.creep; 
        let data = this.taskData; 
        let room = Game.rooms[data.room || creep.memory.home]; 

        // make sure creep and room are still valid 
        if (!creep || !room || !room.controller || !room.controller.my) {
            this.log('task not possible anymore'); 
            return this.finishTask(); 
        }

        if (!data.action) {
            data.action = creep.store.energy > 0 ? 'upgrade' : 'withdraw'; 
        }
        
        if (data.action === 'withdraw') {
            if (this.withdraw()) {
                data.action = 'upgrade'; 
            }
        }
        
        if (data.action === 'upgrade') {
            creep.say("upgrade"); 
            this.upgrade(creep, room.controller); 
        }
    }

    /**
     * @param {Creep} creep 
     * @param {StructureController} controller 
     */
    upgrade(creep, controller) {
        if (creep.store.energy > 0) {
            if (this.move(controller.pos, 3)) {
                if (creep.upgradeController(controller) !== OK) {
                    return this.finishTask(); 
                }
            }
        }
        else {
            return this.finishTask(); 
        }
    }

}

module.exports = UpgradeTaskProcess; 