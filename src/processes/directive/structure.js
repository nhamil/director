'use strict' 

const DirectiveProcess = require('./directive'); 
const spawnQueue = require('../../spawnqueue'); 

class StructureDirectiveProcess extends DirectiveProcess {

    run() {
        let room = this.room; 

        let creeps = util.getCreepsByHomeroomAndRole(room, 'builder'); 
        if (creeps.length < 2) {
            // spawnQueue.request(room, 'builder', false, spawnQueue.HIGH_PRIORITY); 
        }
    }

}

module.exports = StructureDirectiveProcess; 