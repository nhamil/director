'use strict' 

const Directive = require('./directive'); 
const spawnQueue = require('../../spawnqueue'); 
const util = require('../util'); 

class UpgradeDirective extends Directive {

    get priority() {
        return PRIORITY_LOW + 1; 
    }

    run() {
        let room = this.room; 

        if (!(room && room.controller && room.controller.my)) {
            this.log(`Room is no longer owned`); 
            return; 
        }

        let creeps = this.getIdleCreepsByHomeAndRole(room, ['general', 'repairer', 'builder']); 
        for (let creep of creeps) {
            this.assignTask(creep, 'upgrade', {
                room: room.name 
            }); 
        }

        let limit = room.controller.level < 3 ? 10 : 1; 
        let len = this.getCreepsByHomeAndRole(room, 'general').length; 
        if (len < limit) {
            spawnQueue.request(room, 'general', true, len < 1 ? spawnQueue.HIGH_PRIORITY : spawnQueue.MEDIUM_PRIORITY); 
        }
    }

}

module.exports = UpgradeDirective; 