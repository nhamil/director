'use strict' 

const Process = require('../os/process'); 

class CreepProcess extends Process {

    create(args) {
        this.data.name = args.name; 
    }

    run() {
        let creep = Game.creeps[this.data.name]; 
        if (!creep) {
            // this.log(this.data.name + " is dead, killing process"); 
            this.kill(); 
        }
        else {
            let task = creep.memory.task; 
            if (task) {
                let procName = `creep ${creep.name} ${task.id}`; 
                if (!kernel.getPidByName(procName)) {
                    // this.log("Assigned task: " + JSON.stringify(task)); 
                    this.startChild(`task.${task.id}`, procName, task); 
                    this.suspend(); 
                }
            }
        }
    }

}

module.exports = CreepProcess; 