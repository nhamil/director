'use strict' 

const Task = require('./task'); 

/**
 * Data: target id 
 */
class HaulTask extends Task {

    run() {
        if (!this.x) this.x = 0; 
        this.x++; 

        let creep = this.creep; 
        let data = this.data; 

        // make sure creep and build target are still valid 
        if (!creep || !data.target) {
            this.log('task not possible anymore'); 
            return this.finish(); 
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
            return this.finish(); 
        }

        if (!this.target) this.target = target.pos; 

        if (this.target.getRangeTo(target.pos) !== 0) {
            this.log("WARNING Different position: " + this.target + " " + target.pos); 
        }

        if (creep.store.energy > 0) {
            // sleeps the process if creep is too far away and has any fatigue 
            if (this.move(target.pos, 1)) {
                let res = creep.transfer(target, RESOURCE_ENERGY); 
                if (res === OK || res == ERR_FULL) {
                    return this.finish(); 
                }
                else {
                    this.log("Error occured while transferring resource: " + res); 
                    return this.finish(); 
                }
            }
        }
        else {
            return this.finish(); 
        }
    }

}

module.exports = HaulTask; 