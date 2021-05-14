'use strict' 

const Task = require('./task'); 
const util = require('../util'); 

class MineTask extends Task {

    run() {
        let creep = this.creep; 
        let source = Game.getObjectById(this.data.target); 

        if (!creep || !source) {
            this.log('Task not possible anymore'); 
            return this.finish(); 
        }
        
        this.mine(creep, source); 
    }

    /**
     * @param {Creep} creep 
     * @param {Source} source 
     */
    mine(creep, source) {
        let pos = util.getRoomPositionReadData(this.data.pos); 

        let range = 0; 
        if (source.pos.getRangeTo(pos) === 0) {
            range = 1; 
        }

        if (this.move(pos, range)) {
            creep.harvest(source); 
        }
    }

}

module.exports = MineTask; 