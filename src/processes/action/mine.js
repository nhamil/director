'use strict' 

const ActionProcess = require('./action'); 

class MineActionProcess extends ActionProcess {

    runAction() {
        let creep = this.creep; 
        let taskData = this.taskData; 
        
        /** @type {Source} */
        let source = Game.getObjectById(taskData.target); 
        
        if (!source) {
            this.log("Source no longer exists"); 
            return this.finishAction(); 
        }

        let room = source.room; 
        let pos = util.getRoomPositionReadData(taskData.pos); 

        let range = 0; 
        if (source.pos.getRangeTo(pos) === 0) {
            range = 1; 
        }

        if (this.move(pos, range)) {
            creep.harvest(source); 
        }
    }

}

module.exports = MineActionProcess; 