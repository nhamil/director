'use strict' 

const TaskProcess = require('./task'); 

/**
 * Useful for when creep needs to use energy on a nearby thing
 */
class WithdrawTaskProcess extends TaskProcess {

    runTask() {
        let creep = this.creep; 

        // make sure creep and room are still valid 
        if (!creep) {
            this.log('task not possible anymore'); 
            return this.finishTask(); 
        }
        
        if (this.withdraw()) {
            this.finishTask(); 
        }
    }

}

module.exports = WithdrawTaskProcess; 