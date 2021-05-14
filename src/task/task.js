'use strict' 

const Process = require('../process'); 
const director = require('../director'); 
const util = require('../util'); 

class Task extends Process {

    constructor(name) {
        super(name); 
        
        /** @type {Room} */
        this.home = null; 
        /** @type {Room} */
        this.room = null; 
        /** @type {Creep} */
        this.creep = null; 
        /** @type {Object} */
        this.data = null; 
    }

    finish() {
        return director.removeTask(this.creep); 
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
            let res = creep.moveTo(pos, { range: range }); 
            if (res === OK || res === ERR_TIRED || res === ERR_BUSY) {
                if (sleep && creep.fatigue > 0) {
                    // this.sleep(creep.fatigue); 
                }
            }

            return false; 
        }
    }

    withdraw(preferStorage = true, ignore = null) {
        let ignoreList = ignore === null ? [] : ignore; 
        ignore = {}; 
        for (let i of ignoreList) {
            ignore[i] = true; 
        }

        let creep = this.creep; 
        let data = this.data; 

        creep.say("energy"); 

        if (creep.store.getFreeCapacity() === 0) {
            return true; 
        }

        let targetData = data._withdraw || {}; 
        /** @type {RoomObject} */
        let target = null; 
        if (targetData.id) {
            target = Game.getObjectById(targetData.id); 
        }

        if (target) {
            if (targetData.type === 'storage' && target.store.energy === 0) {
                target = null; 
            }
        }

        if (!target) {
            let found = false; 
            if (preferStorage && !found) found = this._findStorageOrContainerEnergy(creep, targetData, ignore); 
            if (!found) found = this._findGroundEnergy(creep, targetData, ignore); 
            if (!preferStorage && !found) found = this._findStorageOrContainerEnergy(creep, targetData, ignore); 
            if (!found) found = this._findActiveSource(creep, targetData, ignore); 
            
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
                else if (targetData.type === 'storage') {
                    creep.withdraw(target, RESOURCE_ENERGY); 
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
    _findActiveSource(creep, data, ignore) {
        let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
            filter: s => !ignore[s.id] 
        }); 
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
    _findGroundEnergy(creep, data, ignore) {
        let remaining = creep.store.getFreeCapacity() + 50; 
        // let remaining = 0; 
        let res = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: s => s.resourceType === RESOURCE_ENERGY && s.amount > remaining && !ignore[s.id]
        })
        if (res) {
            data.id = res.id; 
            data.type = 'pickup'; 
            return true; 
        }

        return false; 
    }

    /**
     * @param {Creep} creep 
     */
    _findStorageOrContainerEnergy(creep, data, ignore) {
        let res = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) && s.store.energy > 0 && !ignore[s.id]
        })
        if (res) {
            data.id = res.id; 
            data.type = 'storage'; 
            return true; 
        }

        return false; 
    }
    
}

module.exports = Task; 