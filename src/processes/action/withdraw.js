'use strict' 

const ActionProcess = require('./action'); 

class WithdrawActionProcess extends ActionProcess {

    runAction() {
        let creep = this.creep; 
        let actionData = this.actionData; 

        /** @type {RoomObject} */
        let target = null; 
        if (actionData.target) {
            target = Game.getObjectById(actionData.target); 
        }

        if (!target) {
            let found = false; 
            if (!found) found = this.findGroundEnergy(creep, actionData); 
            if (!found) found = this.findActiveSource(creep, actionData); 

            if (found) {
                target = Game.getObjectById(actionData.target); 
            }
        }

        if (target) {
            if (this.move(target.pos, 1)) {
                let keep = false; 
                if (actionData.type === 'source') {
                    keep = creep.harvest(target) === 0; 
                }
                else if (actionData.type === 'pickup') {
                    creep.pickup(target); 
                }
                else {
                    this.log("Unknown target type: " + actionData.type); 
                    delete actionData.target; 
                }

                if (!keep) {
                    delete actionData.target; 
                }
            }
        }

        if (creep.store.getFreeCapacity() === 0) {
            return this.finishAction(); 
        }
    }

    /**
     * @param {Creep} creep 
     */
    findActiveSource(creep, data) {
        let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE); 
        if (source) {
            data.target = source.id; 
            data.type = 'source'; 
            return true; 
        }

        return false; 
    }

    /**
     * @param {Creep} creep 
     */
    findGroundEnergy(creep, data) {
        let remaining = creep.store.getFreeCapacity() + 50; 
        let res = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: s => s.resourceType === RESOURCE_ENERGY && s.amount > remaining
        })
        if (res) {
            data.target = res.id; 
            data.type = 'pickup'; 
            return true; 
        }

        return false; 
    }

}

module.exports = WithdrawActionProcess; 