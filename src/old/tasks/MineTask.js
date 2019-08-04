'use strict' 

const Task = require('./Task'); 

const log = require('../log').createLogger('MineTask'); 

class MineTask extends Task {

    constructor() {
        super('mine'); 
    }

    static assign(creep, target) {
        log.debug('Assigning task to ' + creep.name); 
        Task.assign(creep, 'mine', {
            target: target.id 
        });
    }

    static get name() {
        return 'mine'; 
    }

    /**
     * @typedef TaskData 
     * @property {string} pos 
     * @property {string} target 
     * 
     * @param {Creep} creep 
     * @param {TaskData} data 
     */
    update(creep, data) {
        let target = Game.getObjectById(data.target); 

        if (!target) {
            log.warn(creep.name + ' was tasked to mine an invalid target: ' + data.target); 
            return true; 
        }

        let res = creep.harvest(target); 

        if (res === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {
                visualizePathStyle: {
                    stroke: '#ff7', 
                    opacity: 0.5 
                }
            }); 
        }
    }

}

module.exports = MineTask; 