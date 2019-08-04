'use strict' 

const Task = require('./Task'); 

const NAME = 'withdraw'; 

const log = require('../log').createLogger('WithdrawTask'); 

class WithdrawTask extends Task {

    constructor() {
        super(NAME); 
    }

    static assign(creep) {
        log.debug('Assigned task to ' + creep.name); 
        Task.assign(creep, NAME); 
    }

    /**
     * @typedef TaskData 
     * @property {string} target 
     * 
     * @param {Creep} creep 
     * @param {TaskData} data 
     */
    update(creep, data) {
        log.debug('Updating ' + creep.name); 
        let target = Game.getObjectById(data.target); 

        if (!target) {
            log.debug('Searching for withdraw target'); 

            let resource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, r => r.resourceType === RESOURCE_ENERGY); 

            if (resource) {
                target = resource; 
            }
            else {
                target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE); 
            }
        }

        if (!target) {
            log.warn('Could not find target for ' + creep.name); 
            return true; 
        }

        data.target = target.id; 

        log.debug('Target: ' + target); 
        let res; 
        let toStr = target.toString(); 
        
        if (toStr.indexOf('energy') >= 0) { // this first => reSOURCE has source in it 
            // target is a resource 
            res = creep.pickup(target, RESOURCE_ENERGY); 
        }
        else if (toStr.indexOf('source') >= 0) {
            // target is a source 
            res = creep.harvest(target); 
        }
        else {
            // target is a container/storage
            res = creep.withdraw(target, RESOURCE_ENERGY); 
        }

        if (res === ERR_NOT_IN_RANGE) {
            creep.moveTo(target.pos, {
                visualizePathStyle: {
                    stroke: '#ff0', 
                    opacity: 0.25  
                }
            }); 
        }
        else if (res !== OK) {
            log.warn('Unexpected return code: ' + res); 
            return true; 
        }

        return _.sum(creep.carry) === creep.carryCapacity; 
    }

}

module.exports = WithdrawTask; 