'use strict'

class Task {

    constructor(name) {
        this._name = name;
    }

    static assign(creep, task, data = {}) {
        creep.memory.task = task;
        creep.memory.data = data;
    }

    get name() { return this._name; }

    /**
     * 
     * @param {Creep} creep 
     * @param {object} data 
     * @returns {boolean} Whether the task is done (complete or not) 
     */
    update(creep, data) {
        return true;
    }

    toString() {
        return this.name; 
    }

}

module.exports = Task; 