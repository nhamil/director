'use strict' 

let time = Game.time; 
let rooms = {};

/**
 * @typedef RoomData 
 * @property {Object<string, Creep[]>} roles 
 * @property {Object<string, Creep[]>} idleRoles 
 * @property {Object<string, Creep[]>} tasks  
 * 
 * @param {Room} room 
 * @returns {RoomData} 
 */
function getRoomData(room) {
    if (time !== Game.time) {
        time = Game.time; 
        rooms = {}; 
    }
    if (!rooms[room.name]) {
        rooms[room.name] = {
            roles: {}, 
            idleRoles: {}, 
            tasks: {} 
        };
    }
    return rooms[room.name];
}

/**
 * @param {Room} room 
 * @param {Role} role 
 * @returns {Creep[]} 
 */
function getCreepsByRole(room, role) {
    if (typeof role !== 'string') role = role.name; 
    let data = getRoomData(room); 

    if (!data.roles[role]) {
        data.roles[role] = _.filter(Game.creeps, c => {
            return c.my && !c.spawning && c.memory.home === room.name && c.memory.role === role; 
        });
    }

    return data.roles[role]; 
}

/**
 * @param {Room} room 
 * @param {string|Role} role 
 * @returns {Creep[]} 
 */
function getIdleCreepsByRole(room, role) {
    if (typeof role !== 'string') role = role.name; 
    let data = getRoomData(room); 

    if (!data.idleRoles[role]) {
        data.idleRoles[role] = _.filter(Game.creeps, c => {
            return c.my && !c.spawning && c.memory.home === room.name && c.memory.role === role && !c.memory.task; 
        });
    }

    return data.idleRoles[role]; 
}

/**
 * @param {Room} room 
 * @param {string|Task} task 
 * @returns {Creep[]} 
 */
function getCreepsByTask(room, task) {
    if (typeof task !== 'string') task = task.name; 
    let data = getRoomData(room); 

    if (!data.tasks[task]) {
        data.tasks[task] = _.filter(Game.creeps, c => {
            return c.my && !c.spawning && c.memory.home === room.name && c.memory.task === task; 
        });
    }

    return data.tasks[task]; 
}

module.exports = {
    getCreepsByRole, 
    getIdleCreepsByRole, 
    getCreepsByTask  
}