'use strict' 

const ActionProcess = require('./action'); 

class UpgradeActionProcess extends ActionProcess {

    runAction() {
        let creep = this.creep; 
        let room = Game.rooms[this.actionData.room]; 

        // creep or room is not valid anymore 
        if (!creep || !room || !room.controller || !room.controller.my) {
            return this.finishAction(); 
        }

        let controller = room.controller; 

        if (creep.store.energy > 0) {
            // sleeps the process if creep is too far away and has any fatigue 
            if (this.move(controller.pos, 3)) {
                creep.upgradeController(controller); 
            }
        }
        else {
            // creep is done upgrading, wait for new assignment
            return this.finishAction(); 
        }
    }

}

module.exports = UpgradeActionProcess; 