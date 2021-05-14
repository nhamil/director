'use strict' 

const Task = require('./task'); 

class BuildTask extends Task {

    run() {
        let creep = this.creep; 
        let data = this.data; 
        let room = Game.rooms[data.room]; 

        // make sure creep and build target are still valid 
        if (!creep || !data.target) {
            this.log('task not possible anymore'); 
            return this.finish(); 
        }

        if (!data.action) data.action = creep.store.energy > 0 ? 'repair' : 'withdraw'; 

        if (data.action === 'withdraw') {
            if (this.withdraw()) {
                data.action = 'repair'; 
            }
        }

        if (data.action === 'repair') {
            creep.say("repair"); 
            this.repair(creep, data); 
        }
    }

    /**
     * @param {Creep} creep 
     * @param {Object} data 
     */
    repair(creep, data) {
        /** @type {Structure} */
        let target = Game.getObjectById(data.target); 
        
        if (creep.store.getCapacity(RESOURCE_ENERGY) === 0) {
            return this.finish(); 
        }

        if (target.hits >= target.hitsMax) {
            return this.finish(); 
        }

        // if (Game.time % 20 === 0) this.log("Repairing " + target.structureType + " at " + target.pos + " with " + target.hits + "/" + target.hitsMax + " hits"); 

        if (!target) {
            this.log("Repair site no longer exists"); 
            return this.finish(); 
        }

        if (this.move(target.pos, 3)) {
            if (creep.repair(target) !== OK) {
                return this.finish(); 
            } 
        }
    }

}

module.exports = BuildTask; 