'use strict'

const dir = module.exports;

/**
 * @param {Room} room 
 */
dir.run = function (room) {
    let creeps = Director.getCreepsByHome(room, ['worker', 'general']);
    let upgraders = Director.getCreepsByHome(room, ['worker', 'general']);
    let idle = Director.getIdleCreepsByHome(room, ['worker', 'general'])

    // TODO this is without task 
    // if (creeps.length < 2 || upgraders.length < 2) {
        Director.requestSpawn({
            home: room.name, 
            template: 'worker', 
            now: creeps.length === 0, 
            priority: creeps.length === 0 ? 1000 : 100
        }); 
    // }

    util.forEach(idle, c => assignTask(c, room));
}

/**
 * 
 * @param {Creep} c 
 */
let assignTask = function (c, room) {
    if (c.carry.energy) {
        // have energy, go upgrade controller 
        util.assignTaskToCreep(c, {
            id: 'upgrade',
            target: room.name
        });
    }
    else {
        // go get energy 
        util.assignTaskToCreep(c, {
            id: 'withdraw',
            dontPrioritizePickup: true
        });
    }
}