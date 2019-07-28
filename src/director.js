'use strict'

const util = require('./util');

const Directive = require('./directives/directive');
const GeneralDirective = require('./directives/general');
const SpawnDirective = require('./directives/spawn');

class Director {

    constructor() {
        /** 
         * @type {Room[]} 
         */
        this._myRooms = [];

        /**
         * @type {Directive[]} 
         */
        this._directives = [];

        this._initSpawnRequests(); 
    }

    update() {
        this._processRooms();
        for (let dir of this._directives) dir.preFrame();
        for (let dir of this._directives) dir.update();
        for (let dir of this._directives) dir.postFrame();
    }

    /**
     * @param {Room} room 
     * @param {String} templateName 
     * @param {Object} opts 
     */
    requestSpawn(room, templateName, opts = {}) {
        _.defaults(opts, {
            now: false, 
            priority: 1000 
        });

        this._spawnRequests.push({
            room, 
            templateName, 
            now: opts.now, 
            priority: opts.priority
        });
        this._sortRequests = true; 
    }
    
    /**
     * @param {Room} room 
     * @returns {SpawnRequest} 
     */
    getSpawnRequest(room) {
        if (this._sortRequests) {
            this._sortRequests = false; 
            this._spawnRequests.sort((a, b) => a.priority - b.priority); 
        }

        for (let i = 0; i < this._spawnRequests.length; i++) {
            let req = this._spawnRequests[i]; 

            if (req.room === room) {
                this._spawnRequests.splice(i, 1); 
                return req; 
            }
        }

        return req; 
    }

    _initSpawnRequests() {
        /** @type {SpawnRequest[]} */
        this._spawnRequests = [];
        this._sortRequests = false;
    }

    _processRooms() {
        this._myRooms.length = 0;

        _.forEach(Game.rooms, (room) => {
            if (room.controller && room.controller.my) {
                this._myRooms.push(room);
            }
        });

        this._createDirectives();
    }

    _createDirectives() {
        this._directives.length = 0;

        for (let room of this._myRooms) {
            let rcl = room.controller.level;

            this._addDirective(new GeneralDirective(room));
            this._addDirective(new SpawnDirective(room));
        }
    }

    _addDirective(dir) {
        this._directives.push(dir);
    }

}

/** @type {Director} */
global.Director = module.exports = new Director();

// init(); 

// /**
//  * @typedef RoomData 
//  * 
//  * @property {Number} rcl 
//  * @property {Directive[]} directives 
//  */ 

// /**
//  * @type {Room[]} 
//  */
// let ownedRooms = []; 

// function init() {

// }

// function run() {
//     ownedRooms = _.filter(Game.rooms, util.isMyRoom); 

//     assignDirectives(); 

//     Directive.onFrame(); 
//     handlePreRooms(); 
//     handleRooms(); 
//     handlePostRooms(); 
// }

// function handlePreRooms() {
//     for (let name in roomsData) {
//         let data = roomsData[name]; 
//         for (let dir of data.directives) {
//             dir.preFrame(); 
//         }
//     }
// }

// function handleRooms() {
//     for (let name in roomsData) {
//         let data = roomsData[name]; 
//         for (let dir of data.directives) {
//             dir.evaluate(); 
//         }
//     }
// }

// function handlePostRooms() {
//     for (let name in roomsData) {
//         let data = roomsData[name]; 
//         for (let dir of data.directives) {
//             dir.postFrame(); 
//         }
//     }
// }

// function assignDirectives() {
//     for (let room of ownedRooms) {
//         let name = room.name; 
//         let dirs = roomsData[name]; 
//         if (!dirs || dirs.rcl !== room.controller.level) {
//             roomsData[name] = createRoomData(room); 
//         }
//     }
//     // remove old rooms 
//     for (let name in roomsData) {
//         if (!util.isMyRoom(Game.rooms[name])) {
//             delete roomsData[name]; 
//         }
//     }
// }

// /**
//  * @param {Room} room 
//  * @returns {RoomData}
//  */
// function createRoomData(room) {
//     return {
//         rcl: room.controller.level, 
//         directives: [
//             new GeneralDirective(room), 
//             new SpawnDirective(room) 
//         ] 
//     };  
// }

// module.exports = {
//     init, 
//     run 
// };

// // const directivesByRcl = {
// //     1: ['general', 'spawn'],
// //     2: ['defense', 'mine', 'repair', 'supply', 'build', 'upgrade', 'spawn'],
// //     5: ['defense', 'mine', 'repair', 'supply', 'expand', 'build', 'upgrade', 'spawn']
// // };

// // let creepData; 
// // let spawnRequests; 
// // let sortSpawnRequests = false; 

// // Director.directives = require('./directive'); 
// // Director.templates = require('./template'); 
// // Director.tasks = require('./task'); 

// // Director.init = function() {
// //     util.requireField(Memory, 'rooms'); 
// //     util.requireField(Memory, 'creeps'); 
// //     util.requireField(Memory, 'flags'); 
// //     util.requireField(Memory, 'spawns'); 
// //     util.requireField(Memory, 'expandFlags'); 
// //     util.requireField(Memory, 'needsSpawn'); 
// // }

// // Director.run = function() {
// //     processData(); 

// //     handleRooms('preFrame'); 
// //     handleRooms('run'); 
// //     handleRooms('postFrame'); 

// //     handleCreeps(); 

// //     gcByName('creeps'); 
// //     gcByName('powerCreeps'); 
// //     gcByName('spawns'); 
// //     gcByName('flags'); 
// //     for (let name in Memory.rooms) {
// //         if (_.values(Memory.rooms[name]).length === 0) delete Memory.rooms[name]; 
// //     }
// // }

// // /**
// //  * @param {Room} home 
// //  * @param {string|string[]} template 
// //  * @returns {Creep[]|Creep[][]} 
// //  */
// // Director.getIdleCreepsByHome = function(home, template) {
// //     if (typeof template === 'string') {
// //         return util.getField(creepData, `homes.${home.name}.templatesIdle.${template}`, []); 
// //     }
// //     else {
// //         let out = []; 
// //         for (let i = 0; i < template.length; i++) {
// //             out = out.concat(Director.getIdleCreepsByHome(home, template[i])); 
// //         }
// //         return out; 
// //     }
// // }

// // /**
// //  * @param {Room} home 
// //  * @param {string|string[]} template 
// //  * @returns {Creep[]|Creep[][]} 
// //  */
// // Director.getCreepsByHome = function(home, template) {
// //     if (typeof template === 'string') {
// //         return util.getField(creepData, `homes.${home.name}.templates.${template}`, []); 
// //     }
// //     else {
// //         let out = []; 
// //         for (let i = 0; i < template.length; i++) {
// //             out = out.concat(Director.getCreepsByHome(home, template[i])); 
// //         }
// //         return out; 
// //     }
// // }

// // /**
// //  * @param {Room} home 
// //  * @param {string|string[]} task 
// //  * @returns {Creep[]|Creep[][]} 
// //  */
// // Director.getWorkingCreepsByHome = function(home, task) {
// //     if (typeof template === 'string') {
// //         return util.getField(creepData, `homes.${home.name}.tasks.${task}`, []);
// //     }
// //     else {
// //         let out = []; 
// //         for (let i = 0; i < template.length; i++) {
// //             out = out.concat(Director.getWorkingCreepsByHome(home, template[i])); 
// //         }
// //         return out; 
// //     } 
// // }

// // /**
// //  * @typedef SpawnRequest 
// //  * @property {Room} room 
// //  * @property {string} template 
// //  * @property {boolean} [now = false] 
// //  * @property {number} [priority = 1000]; 
// //  */

// //  /**
// //   * @returns {SpawnRequest} 
// //   */
// // Director.getSpawnRequestForRoom = function(room) {
// //     if (sortSpawnRequests) {
// //         // lower number come first 
// //         spawnRequests.sort((a, b) => a.priority - b.priority);
// //         sortSpawnRequests = false; 
// //     }

// //     for (let i in spawnRequests) {
// //         let req = spawnRequests[i]; 

// //         if (req.home === room.name) {
// //             spawnRequests.splice(parseInt(i), 1); 
// //             return req; 
// //         }
// //     }

// //     return null; 
// // } 

// // Director.isSpawnRequestedForRoom = function(room) {
// //     for (let i in spawnRequests) {
// //         let req = spawnRequests[i]; 

// //         if (req.room == room.name) return true; 
// //     }

// //     return false; 
// // }

// // /**
// //  * @param {SpawnRequest} request
// //  */
// // Director.requestSpawn = function(request) {
// //     _.defaults(request, {
// //         now: false, 
// //         priority: 1000 
// //     });

// //     spawnRequests.push(request); 
// //     sortSpawnRequests = true; 
// // }

// // /**
// //  * @param {number} rcl 
// //  * @returns {string[]} 
// //  */
// // const getDirectives = function (rcl) {
// //     for (let i = rcl; i >= 1; i--) {
// //         if (directivesByRcl[i]) return directivesByRcl[i];
// //     }

// //     // shouldn't happen 
// //     return [];
// // }

// // /**
// //  * @param {string} call 
// //  */
// // const handleRooms = function(call) {
// //     for (let name in Game.rooms) {
// //         util.invokeSafe(function() {
// //             let room = Game.rooms[name]; 
// //             if (isMyRoom(room)) {
// //                 handleMyRoom(room, call); 
// //             }
// //         }); 
// //     }
// // }

// // /**
// //  * @param {Room} room 
// //  */
// // const isMyRoom = function(room) {
// //     return room.controller && room.controller.my; 
// // }

// // /**
// //  * @param {Room} room 
// //  * @param {string} call 
// //  */
// // const handleMyRoom = function(room, call) {
// //     let rcl = room.controller.level; 

// //     let directives = getDirectives(rcl); 

// //     for (let i = 0; i < directives.length; i++) {
// //         let name = directives[i]; 
// //         let directive = Director.directives[name]; 
// //         if (directive) {
// //             _.defaults(directive, {
// //                 name: name, 
// //                 rooms: {} 
// //             });
// //             _.defaults(directive.rooms, {
// //                 [room.name]: {} 
// //             });
// //             let directiveFunction = directive[call]; 
// //             if (directiveFunction) {
// //                 util.invokeSafe(function() {
// //                     directiveFunction(room);
// //                 });  
// //             }
// //         }
// //     }
// // }

// // const processData = function() {
// //     spawnRequests = []; 
// //     creepData = {
// //         homes: {}
// //     }; 

// //     for (let name in Game.creeps) {
// //         let c = Game.creeps[name]; 

// //         if (c.my) {
// //             let home = util.getField(c.memory, 'home'); 
// //             let task = util.getField(c.memory, 'task.id'); 
// //             let template = util.getField(c.memory, 'template'); 

// //             let templateList = util.requireField(creepData.homes, `${home}.templates.${template}`, []); 

// //             templateList.push(c); 

// //             if (task) {
// //                 let taskList = util.requireField(creepData.homes, `${home}.tasks.${task}`, []); 
// //                 taskList.push(c); 
// //             }
// //             else {
// //                 let idleList = util.requireField(creepData.homes, `${home}.templatesIdle.${template}`, []); 
// //                 idleList.push(c); 
// //             }
// //         }
// //         else {
// //             creepData.foreigners.push(c); 
// //         }
// //     }
// // }

// // const handleCreeps = function() {
// //     for (let name in Game.creeps) {
// //         let creep = Game.creeps[name]; 

// //         if (creep.my) {
// //             let taskName = util.getField(creep.memory, 'task.id');

// //             if (taskName) {
// //                 let task = Director.tasks[taskName]; 
// //                 if (task) {
// //                     let finished = task.run(creep, creep.memory.task); 
// //                     if (finished) {
// //                         util.finishCreepTask(creep); 
// //                     }
// //                 }
// //                 else {
// //                     util.log(name + ' has unknown task: ' + taskName); 
// //                 }
// //             }
// //             else if (!creep.spawning) {
// //                 util.log(name + ' does not have task'); 
// //             }
// //         }
// //     }
// // }

// // let gcByName = function (entities) {
// //     for (let name in Memory[entities]) {
// //         if (!Game[entities][name]) {
// //             delete Memory[entities][name];
// //         }
// //     }
// // }