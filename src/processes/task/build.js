'use strict' 

const TaskProcess = require('./task'); 

class BuildTaskProcess extends TaskProcess {

    runTask() {
        let creep = this.creep; 
        let data = this.taskData; 
        let room = Game.rooms[data.room]; 

        // make sure creep and build target are still valid 
        if (!creep || !data.target) {
            this.log('task not possible anymore'); 
            return this.finishTask(); 
        }

        if (!data.action) data.action = 'withdraw'; 

        if (data.action === 'withdraw') {
            if (this.withdraw()) {
                data.action = 'build'; 
            }
        }

        if (data.action === 'build') {
            this.build(); 
        }
    }

    /**
     * @param {Creep} creep 
     * @param {Object} data 
     */
    build(creep, data) {
        /** @type {ConstructionSite} */
        let target = Game.getObjectById(taskData.target); 
        
        if (creep.store.getCapacity(RESOURCE_ENERGY) === 0) {
            return this.finishTask(); 
        }

        if (!target) {
            this.log("Construction site no longer exists"); 
            return this.finishTask(); 
        }

        if (this.move(pos, 3)) {
            if (creep.build(target) !== OK) {
                return this.finishTask(); 
            } 
        }
    }

}

module.exports = BuildTaskProcess; 