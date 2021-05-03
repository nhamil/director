'use strict' 

const ActionProcess = require('./action'); 

class BuildActionProcess extends ActionProcess {

    runAction() {
        let creep = this.creep; 
        let taskData = this.taskData; 
        
        /** @type {Source} */
        let target = Game.getObjectById(taskData.target); 
        
        if (creep.store.getCapacity(RESOURCE_ENERGY) === 0) {
            return this.finishAction(); 
        }

        if (!target) {
            this.log("Construction site no longer exists"); 
            return this.finishAction(); 
        }

        if (this.move(pos, 3)) {
            if (creep.build(target) !== OK) {
                return this.finishAction(); 
            } 
        }
    }

}

module.exports = BuildActionProcess; 