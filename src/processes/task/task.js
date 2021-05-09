'use strict' 

const Process = require('../../os/process'); 

class TaskProcess extends Process {

    /**
     * @returns {Creep} 
     */
    get creep() {
        return Game.creeps[this.data.creep]; 
    }

    get taskData() {
        return util.getCreepTask(this.creep); 
    }

    create(args) {
        if (!args.creep) {
            this.log("Task created without a creep, killing process"); 
            return this.kill(); 
        }

        for (let arg in args) {
            this.data[arg] = args[arg]; 
        }
    }

    destroy() {
        let creep = this.creep; 
        if (creep) {
            util.removeCreepTask(creep);
        }
    }

    run() {
        if (!this.creep || !util.doesCreepHaveTask(this.creep)) {
            return this.finishTask(); 
        }
        else {
            return this.runTask(); 
        }
    }

    runTask() {
        return this.finishTask(); 
    } 

    finishTask() {
        this.kill(); 

        let creep = this.creep; 
        if (creep) {
            util.removeCreepTask(creep);
        }
    }

    startAction(action, data = {}) {
        let creep = this.creep; 
        let pidName = `${creep.name}.action.${action}`; 
        util.giveCreepAction(creep, action, data); 

        this.startChildIfNotExist(`action.${action}`, pidName, data); 
        return this.suspend(); 
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

    withdraw() {
        let creep = this.creep; 
        let data = this.taskData; 

        if (creep.store.getFreeCapacity() === 0) {
            return true; 
        }

        let targetData = data._withdraw || {}; 
        /** @type {RoomObject} */
        let target = null; 
        if (targetData.id) {
            target = Game.getObjectById(targetData.id); 
        }

        if (!target) {
            let found = false; 
            if (!found) found = this._findGroundEnergy(creep, targetData); 
            if (!found) found = this._findActiveSource(creep, targetData); 

            if (found) {
                target = Game.getObjectById(targetData.id); 
            }
        }

        if (target) {
            data._withdraw = targetData; 

            if (this.move(target.pos, 1)) {
                let keep = false; 
                if (targetData.type === 'source') {
                    keep = creep.harvest(target) === OK; 
                }
                else if (targetData.type === 'pickup') {
                    creep.pickup(target); 
                }
                else {
                    this.log("Unknown target type: " + targetData.type); 
                }

                if (!keep) {
                    delete data._withdraw; 
                }
            }
        }

        return creep.store.getFreeCapacity() === 0; 
    }

    /**
     * @param {Creep} creep 
     */
    _findActiveSource(creep, data) {
        let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE); 
        if (source) {
            data.id = source.id; 
            data.type = 'source'; 
            return true; 
        }

        return false; 
    }

    /**
     * @param {Creep} creep 
     */
    _findGroundEnergy(creep, data) {
        let remaining = creep.store.getFreeCapacity() + 50; 
        let res = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: s => s.resourceType === RESOURCE_ENERGY && s.amount > remaining
        })
        if (res) {
            data.id = res.id; 
            data.type = 'pickup'; 
            return true; 
        }

        return false; 
    }

}

module.exports = TaskProcess; 