'use strict' 

const TaskProcess = require('./task'); 

class BuildTaskProcess extends TaskProcess {

    runTask() {
        let creep = this.creep; 
        let room = Game.rooms[this.taskData.room]; 

        // make sure creep and build target are still valid 
        if (!creep || !this.taskData.target) {
            this.log('task not possible anymore'); 
            return this.finishTask(); 
        }
        
        if (creep.store.energy === 0) {
            // only build once, wait for new assignment
            if (this.taskData.remove) {
                return this.finishTask(); 
            }
            // get energy in whatever way possible 
            return this.startAction('withdraw'); 
        }
        else {
            this.taskData.remove = true; 
            // move to target and build 
            return this.startAction('build'); 
        }
    }

}

module.exports = BuildTaskProcess; 