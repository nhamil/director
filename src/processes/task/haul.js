'use strict' 

const TaskProcess = require('./task'); 

/**
 * Data: target id 
 */
class HaulTaskProcess extends TaskProcess {

    runTask() {
        // return this.finishTask(); 
        let creep = this.creep; 
        let data = this.taskData; 

        // make sure creep and build target are still valid 
        if (!creep || !data.target) {
            this.log('task not possible anymore'); 
            return this.finishTask(); 
        }

        if (!data.action) data.action = 'withdraw'; 

        if (data.action === 'withdraw') {
            if (this.withdraw()) {
                data.action = 'transfer'; 
            }
        }

        if (data.action === 'transfer') {
            this.transfer(creep, data); 
        }
    }

    /**
     * @param {Creep} creep 
     * @param {Object} data 
     * @returns 
     */
    transfer(creep, data) {
        /** @type {Structure | Creep} */
        let target = Game.getObjectById(data.target); 

        // creep or room is not valid anymore 
        if (!creep || !target) {
            this.log("task can no longer be completed"); 
            return this.finishTask(); 
        }

        if (creep.store.energy > 0) {
            // sleeps the process if creep is too far away and has any fatigue 
            if (this.move(target.pos, 1)) {
                let res = creep.transfer(target, RESOURCE_ENERGY); 
                if (res === OK || res == ERR_FULL) {
                    return this.finishTask(); 
                }
                else {
                    this.log("Error occured while transferring resource"); 
                    return this.finishTask(); 
                }
            }
        }
        else {
            return this.finishTask(); 
        }
    }

}

module.exports = HaulTaskProcess; 