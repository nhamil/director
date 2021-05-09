'use strict' 

const DirectiveProcess = require('./directive'); 
const spawnQueue = require('../../spawnqueue'); 

class StartupDirectiveProcess extends DirectiveProcess {

    run() {
        let room = Game.rooms[this.data.room]; 

        if (!(room && room.controller && room.controller.my)) {
            this.log(`Room is no longer owned`); 
            return this.kill(); 
        }

        let creeps = util.getCreepsByHomeroomAndRoleWithoutTask(room, 'general'); 
        for (let creep of creeps) {
            util.giveCreepTask(creep, 'upgrade', {
                room: room.name 
            }); 
        }

        if (util.getCreepsByHomeroomAndRole(room, 'general').length < 10) {
            spawnQueue.request(room, 'general', true, spawnQueue.MEDIUM_PRIORITY); 
        }
    }

}

module.exports = StartupDirectiveProcess; 