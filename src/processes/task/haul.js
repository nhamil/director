'use strict' 

const TaskProcess = require('./task'); 

/**
 * Data: target id 
 */
class HaulTaskProcess extends TaskProcess {

    runTask() {
        if (!this.x) this.x = 0; 
        this.x++; 

        // return this.finishTask(); 
        let creep = this.creep; 
        let data = this.taskData; 

        // make sure creep and build target are still valid 
        if (!creep || !data.target) {
            this.log('task not possible anymore'); 
            return this.finishTask(); 
        }

        if (!data.action) data.action = creep.store.energy > 0 ? 'transfer' : 'withdraw'; 

        if (data.action === 'withdraw') {
            if (this.withdraw(false, [data.target])) {
                data.action = 'transfer'; 
            }
        }

        if (data.action === 'transfer') {
            creep.say("transfer"); 
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

        if (!this.target) this.target = target.pos; 

        if (this.target.getRangeTo(target.pos) !== 0) {
            this.log("WARNING Different position: " + this.target + " " + target.pos); 
        }

        // if (Game.time % 50 === 0) {
            // this.log("Trying to transfer energy to " + target.pos + " from " + creep.pos + " with a range of " + creep.pos.getRangeTo(target.pos) + " (" + creep.store.energy + " energy) " + this.x); 
        // }

        if (creep.store.energy > 0) {
            // sleeps the process if creep is too far away and has any fatigue 
            if (this.move(target.pos, 1)) {
                // if (Game.time % 50 === 0) {
                    // this.log("Close enough to " + target.pos); 
                // }
                let res = creep.transfer(target, RESOURCE_ENERGY); 
                if (res === OK || res == ERR_FULL) {
                    // this.log("Transfer successful"); 
                    return this.finishTask(); 
                }
                else {
                    this.log("Error occured while transferring resource: " + res); 
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