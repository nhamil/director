'use strict' 

const DirectiveProcess = require('./directive'); 
const spawnQueue = require('../../spawnqueue'); 

class StartupDirectiveProcess extends DirectiveProcess {

    get priority() {
        return PRIORITY_LOW; 
    }

    run() {
        let room = Game.rooms[this.data.room]; 

        if (!(room && room.controller && room.controller.my)) {
            this.log(`Room is no longer owned`); 
            return this.kill(); 
        }

        let creeps = util.getCreepsByHomeroomAndRoleWithoutTask(room, ['general', 'repairer', 'builder']); 
        for (let creep of creeps) {
            util.giveCreepTask(creep, 'upgrade', {
                room: room.name 
            }); 
        }

        let limit = room.controller.level < 3 ? 10 : 1; 
        let len = util.getCreepsByHomeroomAndRole(room, 'general').length; 
        if (len < limit) {
            spawnQueue.request(room, 'general', true, len < 1 ? spawnQueue.HIGH_PRIORITY : spawnQueue.MEDIUM_PRIORITY); 
        }
    }

}

module.exports = StartupDirectiveProcess; 