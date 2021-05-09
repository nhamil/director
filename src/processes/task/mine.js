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
        
        this.mine(creep, source); 
    }

    /**
     * @param {Creep} creep 
     * @param {Source} source 
     */
    mine(creep, source) {
        let room = source.room; 
        let pos = util.getRoomPositionReadData(this.taskData.pos); 

        let range = 0; 
        if (source.pos.getRangeTo(pos) === 0) {
            range = 1; 
        }

        if (this.move(pos, range)) {
            creep.harvest(source); 
        }
    }

}

module.exports = MineTaskProcess; 