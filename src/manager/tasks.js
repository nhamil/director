'use strict' 

// for creep-level decisions 

/**
 * @typedef {import('../task/task')} Task 
 */

const util = require('../util'); 

const classes = {}; 
const cache = {}; 

/**
 * @param {string} name 
 */
function register(name) {
    try {
        let tClass = require('task.' + name); 
        classes[name] = tClass; 
    }
    catch (e) {
        console.log("Task not found: " + name + ": " + e); 
    }
}

/**
 * @param {Creep} creep 
 */
function run(creep) {
    if (!creep.memory.role || !creep.memory.home) {
        console.log("Creep is missing home or role, suiciding"); 
        creep.suicide(); 
        return; 
    }

    if (creep.memory.task) {
        try {
            let task = getTask(creep); 
            if (task) task.run(creep); 
        }
        catch (e) {
            console.log("Error while running task " + creep.memory.task + " for creep " + creep.name + ": " + e.stack); 
        }
    }
}

/**
 * @param {Creep} creep 
 */
function getTask(creep) {
    let tName = creep.memory.task; 
    let name = creep.name + '.task.' + tName; 

    /** @type {Task} */
    let proc = null; 
    if (cache[name]) {
        proc = cache[name]; 
        proc.home = Game.rooms[creep.memory.home] || null; 
        proc.room = creep.room; 
        proc.creep = creep; 
        proc.data = creep.memory.data = creep.memory.data || {}; 
    }
    else {
        try {
            proc = new classes[tName](name); 
            proc.home = Game.rooms[creep.memory.home] || null; 
            proc.room = creep.room; 
            proc.creep = creep; 
            proc.data = creep.memory.data = creep.memory.data || {}; 
            proc.reload(); 
            cache[name] = proc; 
        }
        catch (e) {
            console.log("Error while creating task " + tName + " for " + creep.name + ": " + e.stack); 
        }
    }

    return proc; 
}

/**
 * @param {Creep} creep 
 * @param {string} task 
 * @param {Object} data 
 */
function assign(creep, task, data = null) {
    // console.log("Assigning " + task + " task to " + creep.name + ": " + JSON.stringify(data || {})); 
    remove(creep); 
    creep.memory.task = task; 
    creep.memory.data = data || {}; 
}

/**
 * @param {Creep} creep 
 */
function remove(creep) {
    if (creep.memory.task) {
        let name = creep.name + '.task.' + creep.memory.task; 
        delete cache[name]; 
    }

    delete creep.memory.task; 
    delete creep.memory.data; 
}

/**
 * @param {Creep} creep 
 */
function get(creep) {
    if (creep.memory.task) {
        return {
            /** @type {string} */
            id: creep.memory.task, 
            /** @type {Object} */
            data: creep.memory.data || {}
        };
    }
    else {
        return null; 
    }
}

/**
 * @param {Creep} creep 
 */
function has(creep) {
    return !!creep.memory.task; 
}

module.exports = {
    assign, 
    remove, 
    get, 
    has, 
    register, 
    run
};