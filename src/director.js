'use strict' 

global.Director = module.exports; 

class Director {

    static init() {

    }

    static run() {

    }

    static getIdleCreepsByHome(home, template) {

    }

    static getCreepsByHome(home, template) {

    }

    static getWorkingCreepsByHome(home, task) {

    }

    static requestSpawn(request) {

    }

    static getSpawnRequestForRoom(room) {

    }

    static isSpawnRequestedForRoom(room) {
        
    }

}

const directivesByRcl = {
    1: ['general', 'spawn'],
    2: ['defense', 'mine', 'repair', 'supply', 'build', 'upgrade', 'spawn'],
    5: ['defense', 'mine', 'repair', 'supply', 'expand', 'build', 'upgrade', 'spawn']
};

let creepData; 
let spawnRequests; 
let sortSpawnRequests = false; 

Director.directives = require('./directive'); 
Director.templates = require('./template'); 
Director.tasks = require('./task'); 

Director.init = function() {
    util.requireField(Memory, 'rooms'); 
    util.requireField(Memory, 'creeps'); 
    util.requireField(Memory, 'flags'); 
    util.requireField(Memory, 'spawns'); 
    util.requireField(Memory, 'expandFlags'); 
    util.requireField(Memory, 'needsSpawn'); 
}

Director.run = function() {
    processData(); 

    handleRooms('preFrame'); 
    handleRooms('run'); 
    handleRooms('postFrame'); 

    handleCreeps(); 

    gcByName('creeps'); 
    gcByName('powerCreeps'); 
    gcByName('spawns'); 
    gcByName('flags'); 
    for (let name in Memory.rooms) {
        if (_.values(Memory.rooms[name]).length === 0) delete Memory.rooms[name]; 
    }
}

/**
 * @param {Room} home 
 * @param {string|string[]} template 
 * @return {Creep[]|Creep[][]} 
 */
Director.getIdleCreepsByHome = function(home, template) {
    if (typeof template === 'string') {
        return util.getField(creepData, `homes.${home.name}.templatesIdle.${template}`, []); 
    }
    else {
        let out = []; 
        for (let i = 0; i < template.length; i++) {
            out = out.concat(Director.getIdleCreepsByHome(home, template[i])); 
        }
        return out; 
    }
}

/**
 * @param {Room} home 
 * @param {string|string[]} template 
 * @return {Creep[]|Creep[][]} 
 */
Director.getCreepsByHome = function(home, template) {
    if (typeof template === 'string') {
        return util.getField(creepData, `homes.${home.name}.templates.${template}`, []); 
    }
    else {
        let out = []; 
        for (let i = 0; i < template.length; i++) {
            out = out.concat(Director.getCreepsByHome(home, template[i])); 
        }
        return out; 
    }
}

/**
 * @param {Room} home 
 * @param {string|string[]} task 
 * @return {Creep[]|Creep[][]} 
 */
Director.getWorkingCreepsByHome = function(home, task) {
    if (typeof template === 'string') {
        return util.getField(creepData, `homes.${home.name}.tasks.${task}`, []);
    }
    else {
        let out = []; 
        for (let i = 0; i < template.length; i++) {
            out = out.concat(Director.getWorkingCreepsByHome(home, template[i])); 
        }
        return out; 
    } 
}

/**
 * @typedef SpawnRequest 
 * @property {Room} room 
 * @property {string} template 
 * @property {boolean} [now = false] 
 * @property {number} [priority = 1000]; 
 */

 /**
  * @return {SpawnRequest} 
  */
Director.getSpawnRequestForRoom = function(room) {
    if (sortSpawnRequests) {
        // lower number come first 
        spawnRequests.sort((a, b) => a.priority - b.priority);
        sortSpawnRequests = false; 
    }

    for (let i in spawnRequests) {
        let req = spawnRequests[i]; 

        if (req.home === room.name) {
            spawnRequests.splice(parseInt(i), 1); 
            return req; 
        }
    }

    return null; 
} 

Director.isSpawnRequestedForRoom = function(room) {
    for (let i in spawnRequests) {
        let req = spawnRequests[i]; 

        if (req.room == room.name) return true; 
    }

    return false; 
}

/**
 * @param {SpawnRequest} request
 */
Director.requestSpawn = function(request) {
    _.defaults(request, {
        now: false, 
        priority: 1000 
    });

    spawnRequests.push(request); 
    sortSpawnRequests = true; 
}

/**
 * @param {number} rcl 
 * @return {string[]} 
 */
const getDirectives = function (rcl) {
    for (let i = rcl; i >= 1; i--) {
        if (directivesByRcl[i]) return directivesByRcl[i];
    }

    // shouldn't happen 
    return [];
}

/**
 * @param {string} call 
 */
const handleRooms = function(call) {
    for (let name in Game.rooms) {
        util.invokeSafe(function() {
            let room = Game.rooms[name]; 
            if (isMyRoom(room)) {
                handleMyRoom(room, call); 
            }
        }); 
    }
}

/**
 * @param {Room} room 
 */
const isMyRoom = function(room) {
    return room.controller && room.controller.my; 
}

/**
 * @param {Room} room 
 * @param {string} call 
 */
const handleMyRoom = function(room, call) {
    let rcl = room.controller.level; 

    let directives = getDirectives(rcl); 

    for (let i = 0; i < directives.length; i++) {
        let name = directives[i]; 
        let directive = Director.directives[name]; 
        if (directive) {
            _.defaults(directive, {
                name: name, 
                rooms: {} 
            });
            _.defaults(directive.rooms, {
                [room.name]: {} 
            });
            let directiveFunction = directive[call]; 
            if (directiveFunction) {
                util.invokeSafe(function() {
                    directiveFunction(room);
                });  
            }
        }
    }
}

const processData = function() {
    spawnRequests = []; 
    creepData = {
        homes: {}
    }; 

    for (let name in Game.creeps) {
        let c = Game.creeps[name]; 

        if (c.my) {
            let home = util.getField(c.memory, 'home'); 
            let task = util.getField(c.memory, 'task.id'); 
            let template = util.getField(c.memory, 'template'); 

            let templateList = util.requireField(creepData.homes, `${home}.templates.${template}`, []); 

            templateList.push(c); 

            if (task) {
                let taskList = util.requireField(creepData.homes, `${home}.tasks.${task}`, []); 
                taskList.push(c); 
            }
            else {
                let idleList = util.requireField(creepData.homes, `${home}.templatesIdle.${template}`, []); 
                idleList.push(c); 
            }
        }
        else {
            creepData.foreigners.push(c); 
        }
    }
}

const handleCreeps = function() {
    for (let name in Game.creeps) {
        let creep = Game.creeps[name]; 

        if (creep.my) {
            let taskName = util.getField(creep.memory, 'task.id');
            
            if (taskName) {
                let task = Director.tasks[taskName]; 
                if (task) {
                    let finished = task.run(creep, creep.memory.task); 
                    if (finished) {
                        util.finishCreepTask(creep); 
                    }
                }
                else {
                    util.log(name + ' has unknown task: ' + taskName); 
                }
            }
            else if (!creep.spawning) {
                util.log(name + ' does not have task'); 
            }
        }
    }
}

let gcByName = function (entities) {
    for (let name in Memory[entities]) {
        if (!Game[entities][name]) {
            delete Memory[entities][name];
        }
    }
}