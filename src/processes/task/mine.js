'use strict' 

const TaskProcess = require('./task'); 

class MineTaskProcess extends TaskProcess {

    runTask() {
        let creep = this.creep; 
        let source = Game.getObjectById(this.taskData.target); 

        if (!creep || !source) {
            this.log('task not possible anymore'); 
            return this.finishTask(); 
        }
        
        return this.startAction('mine'); 
    }

}

module.exports = MineTaskProcess; 