'use strict' 

const creeps = require('../creeps'); 
const roles = require('../roles'); 
const spawn = require('../spawn'); 

const RoomDirective = require('./RoomDirective'); 

const UpgradeTask = require('../tasks/UpgradeTask'); 
const WithdrawTask = require('../tasks/WithdrawTask'); 

const log = require('../log').createLogger('UpgradeDirective'); 

class UpgradeDirective extends RoomDirective {

    constructor() {
        super('upgrade'); 
    }

    preUpdateRoom(room) {
        spawn.addRequest(room, roles.worker); 
    }

    updateRoom(room) {
        let idleCreeps = creeps.getCreepsByRole(room, roles.worker); 

        for (let creep of idleCreeps) {
            let carry = _.sum(creep.carry); 

            if (carry === 0) {
                WithdrawTask.assign(creep); 
            }
            else {
                UpgradeTask.assign(creep, room.controller); 
            }
        }
    }

}

module.exports = UpgradeDirective; 