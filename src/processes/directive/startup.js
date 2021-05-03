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

        // we can always use more early workers 
        spawnQueue.request(room, 'general', true, spawnQueue.MEDIUM_PRIORITY); 

        let creeps = util.getCreepsByHomeroomAndRoleWithoutTask(room, 'general'); 
        for (let creep of creeps) {
            util.giveCreepTask(creep, 'upgrade', {
                room: room.name 
            }); 
        }
    }

}

module.exports = StartupDirectiveProcess; 