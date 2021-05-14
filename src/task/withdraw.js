'use strict' 

const Task = require('./task'); 

/**
 * Useful for when creep needs to use energy on a nearby thing
 */
class WithdrawTask extends Task {

    run() {
        let creep = this.creep; 

        // make sure creep and room are still valid 
        if (!creep) {
            this.log('task not possible anymore'); 
            return this.finish(); 
        }
        
        if (this.withdraw()) {
            this.finish(); 
        }
    }

}

module.exports = WithdrawTask; 