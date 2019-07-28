'use strict'

const Task = require('./task'); 

class WithdrawTask extends Task {

    evaluate() {
        let source = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE); 
        
        if (source) {
            let res = this.harvest(source); 

            if (res !== OK) {
                this.moveTo(source); 
            }
        }
        else {
            return true; 
        }

        return this.isCreepFull(); 
    }

}

module.exports = WithdrawTask; 
