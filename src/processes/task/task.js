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
        if (!this.creep) {
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

}

module.exports = TaskProcess; 