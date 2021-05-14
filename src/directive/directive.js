'use strict' 

const Process = require('../process'); 
const director = require('../director'); 

class Directive extends Process {

    constructor(name) {
        super(name); 
        
        /** @type {Room} */
        this.room = null; 
        /** @type {Object} */
        this.data = null; 
    }

    /**
     * @param {Creep} creep 
     */
    getRole(creep) {
        return director.getRole(creep); 
    }

    /**
     * @param {Creep} creep 
     */
    getTask(creep) {
        return director.getTask(creep); 
    }

    /**
     * @param {Creep} creep 
     */
    hasTask(creep) {
        return director.hasTask(creep); 
    }

    /**
     * @param {Creep} creep 
     * @param {string} task 
     * @param {Object} data 
     */
    assignTask(creep, task, data = null) {
        return director.assignTask(creep, task, data); 
    }

    /**
     * @param {Creep} creep 
     */
    removeTask(creep) {
        return director.removeTask(creep); 
    }

    /**
     * @param {Room} room 
     * @param {string[]|string} role
     */
    getCreepsByHomeAndRole(room, role) {
        return director.getCreepsByHomeAndRole(room, role); 
    }

    /**
     * @param {Room} room 
     * @param {string[]|string} role
     */
    getIdleCreepsByHomeAndRole(room, role) {
        return director.getIdleCreepsByHomeAndRole(room, role); 
    }

}

module.exports = Directive; 