'use strict' 

const DirectiveProcess = require('./directive'); 
const spawnQueue = require('../../spawnqueue'); 

class HaulDirectiveProcess extends DirectiveProcess {

    run() {
        let room = this.room;
        let creeps = util.getCreepsByHomeroomAndRole(room, 'hauler'); 

    }

}

module.exports = HaulDirectiveProcess; 