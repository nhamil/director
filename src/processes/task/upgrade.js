'use strict' 

const TaskProcess = require('./task'); 

class UpgradeTaskProcess extends TaskProcess {

    runTask() {
        let creep = this.creep; 
        let room = Game.rooms[this.taskData.room]; 

        // make sure creep and room are still valid 
        if (!creep || !room || !room.controller || !room.controller.my) {
            this.log('task not possible anymore'); 
            return this.finishTask(); 
        }
        
        if (creep.store.energy === 0) {
            // only do an upgrade once, wait for new assignment
            if (this.taskData.upgraded) {
                return this.finishTask(); 
            }
            // get energy in whatever way possible 
            return this.startAction('withdraw'); 
        }
        else {
            this.taskData.upgraded = true; 
            // move to controller and upgrade 
            return this.startAction('upgrade', {
                room: room.name 
            }); 
        }
    }

}

module.exports = UpgradeTaskProcess; 