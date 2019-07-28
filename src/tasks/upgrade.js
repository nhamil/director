'use strict'

const task = module.exports;

/**
 * @param {Creep} creep 
 */
task.run = function (creep, data) {
    let roomName = data.target || creep.room.name;
    let target = Game.rooms[roomName].controller;

    util.doOrMoveTo(creep, target, 'upgradeController', {
        ok: [OK, ERR_NOT_ENOUGH_ENERGY]
    });

    return creep.carry[RESOURCE_ENERGY] === 0;
}