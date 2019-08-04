'use strict' 

const Task = require('./Task'); 

const NAME = 'upgrade'; 

const log = require('../log').createLogger('UpgradeTask'); 

class UpgradeTask extends Task {

    constructor() {
        super(NAME); 
    }

    static assign(creep, controller) {
        log.debug('Assigned task to ' + creep.name + ' with target ' + controller.room.name); 
        Task.assign(creep, NAME, {
            target: controller.id 
        });
    }

    /**
     * @typedef UpgradeData
     * @property {string} target
     * 
     * @param {Creep} creep 
     * @param {UpgradeData} data 
     */
    update(creep, data) {
        let target = Game.getObjectById(data.target); 

        if (!target) {
            console.log('Invalid upgrade target: ' + data.target); 
            return true; 
        }

        let res = creep.upgradeController(target); 

        if (res === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {
                visualizePathStyle: {
                    stroke: '#f0f', 
                    opacity: 0.25 
                }
            }); 
        }
        else if (res !== OK) {
            return true; 
        }

        return creep.carry.energy === 0; 
    }

}

module.exports = UpgradeTask; 