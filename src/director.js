'use strict' 

const util = require('./util'); 

const directives = require('./manager/directives'); 
const spawnQueue = require('./spawnqueue'); 
const tasks = require('./manager/tasks'); 

function run() {
    spawnQueue.clear(); 

    const rooms = _.filter(Game.rooms, r => r.controller && r.controller.my); 
    _.sortBy(rooms, 'time'); 
    for (let r of rooms) {
        directives.run(r); 
    }

    const creeps = _.toArray(Game.creeps);  
    _.sortBy(creeps, 'time'); 
    for (let c of creeps) {
        tasks.run(c); 
    }

    gc(); 
}

function gc() {
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) delete Memory.creeps[name]; 
    }
}

/**
 * @param {Creep} creep 
 * @returns {string}
 */
function getRole(creep) {
    return creep.memory.role; 
}

/**
 * @param {Room} room 
 * @param {string|string[]} role 
 * @returns {Creep[]} 
 */
function getCreepsByHomeAndRole(room, role) {
    let roles = {}; 
    if (typeof(role) === 'string') {
        roles[role] = true; 
    }
    else {
        for (let i in role) roles[role[i]] = true; 
    }

    return _.filter(Game.creeps, c => c.memory.home === room.name && roles[c.memory.role]); 
}
 
 /**
  * @param {Room} room 
  * @param {string|string[]} role 
  * @returns {Creep[]} 
  */
function getIdleCreepsByHomeAndRole(room, role) {
    let roles = {}; 
    if (typeof(role) === 'string') {
        roles[role] = true; 
    }
    else {
        for (let i in role) roles[role[i]] = true; 
    }

    return _.filter(Game.creeps, c => c.memory.home === room.name && roles[c.memory.role] && !c.memory.task); 
}

module.exports = {
    registerDirective: directives.register,  
    registerTask: tasks.register, 
    run, 

    assignTask: tasks.assign, 
    removeTask: tasks.remove, 
    getTask: tasks.get, 
    hasTask: tasks.has, 
    getRole, 
    getCreepsByHomeAndRole, 
    getIdleCreepsByHomeAndRole
};

// for console 
global.Director = module.exports; 