'use strict' 

const Task = require('./task'); 

class BuildTask extends Task {

    run() {
        let creep = this.creep; 
        let data = this.data; 
        let room = Game.rooms[data.room]; 

        // make sure creep and build target are still valid 
        if (!creep || !data.target) {
            this.log('Task not possible anymore'); 
            return this.finish(); 
        }

        if (!data.action) data.action = creep.store.energy > 0 ? 'build' : 'withdraw'; 

        if (data.action === 'withdraw') {
            if (this.withdraw()) {
                data.action = 'build'; 
            }
        }

        if (data.action === 'build') {
            creep.say("build"); 
            this.build(creep, data); 
        }
    }

    /**
     * @param {Creep} creep 
     * @param {Object} data 
     */
    build(creep, data) {
        /** @type {ConstructionSite} */
        let target = Game.getObjectById(data.target); 
        
        if (creep.store.getCapacity(RESOURCE_ENERGY) === 0) {
            return this.finish(); 
        }

        if (!target) {
            // this.log("Construction site no longer exists"); 
            return this.finish(); 
        }

        if (this.move(target.pos, 3)) {
            if (creep.build(target) !== OK) {
                return this.finish(); 
            } 
        }
    }

}

module.exports = BuildTask; 