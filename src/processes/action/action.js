'use strict' 

const Process = require('../../os/process'); 

class ActionProcess extends Process {

    get priority() {
        return PRIORITY_MEDIUM; 
    }

    /**
     * @returns {Creep} 
     */
    get creep() {
        let data = kernel.data(this.ppid); 
        if (data) {
            return Game.creeps[data.creep]; 
        }
        else {
            return null; 
        }
    }

    get actionData() {
        return util.getCreepAction(this.creep); 
    }

    get taskData() {
        return util.getCreepTask(this.creep); 
    }

    destroy() {
        this.wakeParent(); 

        let creep = this.creep; 
        if (creep) {
            util.removeCreepAction(creep); 
        }
    }

    run() {
        let creep = this.creep; 

        if (!creep || !util.doesCreepHaveAction(creep)) {
            return this.finishAction(); 
        }
        else {
            return this.runAction(creep); 
        }
    }

    runAction() {
        return this.finishAction(); 
    }

    finishAction() {
        this.killAndWakeParent(true); 

        let creep = this.creep; 
        if (creep) {
            util.removeCreepAction(creep); 
        }
    }

    /**
     * @param {RoomPosition} pos 
     * @param {number} range 
     * @param {boolean} sleep 
     * @returns {boolean} If creep has reached the target
     */
     move(pos, range, sleep = true) {
        let creep = this.creep; 

        if (creep.pos.inRangeTo(pos, range)) {
            return true; 
        }
        else {
            if (creep.moveTo(pos.x, pos.y) === OK) {
                if (sleep && creep.fatigue > 0) {
                    this.sleep(creep.fatigue); 
                }
            }

            return false; 
        }
    }

}

module.exports = ActionProcess; 