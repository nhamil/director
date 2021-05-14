'use strict'

// for colony-level decisions 

/**
 * @typedef {import('../directive/directive')} Directive 
 */

const util = require('../util'); 

const order = []; 
const classes = {}; 
const cache = {}; 

/**
 * @param {string} name 
 */
function register(name) {
    try {
        let dClass = require('directive.' + name); 
        classes[name] = dClass; 
        order.push(name); 
    }
    catch (e) {
        console.log("Directive not found: " + name + ": " + e); 
    }
}

/**
 * @param {Room} room 
 */
function run(room) {
    if (room.controller && room.controller.my) {
        for (let dName of order) {
            try {
                let dir = getDirective(room, dName); 
                if (dir) dir.run(); 
            }
            catch (e) {
                console.log("Error while running " + dName + " directive for " + room.name + ": " + e.stack); 
            }
        }
    }
}

function getDirectiveMemory(room) {
    return room.memory.directives = room.memory.directives || {}; 
}

/**
 * @param {Room} room 
 */
function getDirective(room, dName) {
    let dirs = getDirectiveMemory(room); 

    dirs[dName] = dirs[dName] || {}; 
    let name = room.name + '.directive.' + dName; 

    /** @type {Directive} */
    let proc = null; 
    if (cache[name]) {
        proc = cache[name]; 
        proc.room = room; 
        proc.data = dirs[dName]; 
    }
    else {
        try {
            proc = new classes[dName](name); 
            proc.room = room; 
            proc.data = dirs[dName]; 
            proc.reload(); 
            cache[name] = proc; 
        }
        catch (e) {
            console.log("Error while creating directive " + dName + " for " + room.name + ": " + e); 
        }
    }

    return proc; 
}

module.exports = {
    register, 
    run
};