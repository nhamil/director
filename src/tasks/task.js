'use strict' 

const log = require('../log'); 



class Task {

    /**
     * @param {Room} room 
     * @param {Creep} creep 
     */
    constructor(room, creep) {
        this.room = room; 
        this.creep = creep; 
    }

    get data() {
        return this.creep.memory.data = this.creep.memory.data || {}; 
    }

    /**
     * @returns {Boolean} Whether the task is done or not 
     */
    evaluate() {
        log.writeRoom(this.room, this.creep.name + ' has invalid task, quitting'); 
        return true; 
    }

    moveTo(target) { return this.creep.moveTo(target); }
    withdraw(target, res, amt) { return this.creep.withdraw(target, res, amt); }
    harvest(target) { return this.creep.harvest(target); }

    isCreepFull() {
        return _.sum(this.creep.carry) === this.creep.carryCapacity; 
    }
    
    isCreepEmpty() {
        return _.sum(this.creep.carry) === 0; 
    }

}

module.exports = Task; 