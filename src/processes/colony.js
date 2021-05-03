'use strict' 

const Process = require('../os/process'); 

const colonyDirectives = {
    1: ['startup', 'spawn'], 
    2: ['mine', 'haul', 'structure', 'startup', 'spawn'], 
};

let allDirectives = {}; 
for (let dirs of _.values(colonyDirectives)) {
    for (let dir of dirs) {
        allDirectives[dir] = 1; 
    }
}
allDirectives = _.keys(allDirectives); 

const rejectDirectives = {}; 
for (let rcl in colonyDirectives) {
    let cDirs = colonyDirectives[rcl]; 
    let list = []; 
    for (let dir of allDirectives) {
        if (!cDirs.includes(dir)) {
            list.push(dir); 
        }
    }
    rejectDirectives[rcl] = list; 
}

class ColonyProcess extends Process {

    create(args) {
        this.data.room = args.room; 
    }

    reload() {}

    run() {
        let room = Game.rooms[this.data.room]; 

        if (!room.controller || !room.controller.my) {
            this.log("Room is no longer owned, killing process"); 
            return this.kill(); 
        }

        let rcl = room.controller.level; 

        // find directive list closest to room RCL 
        for (let i = rcl; i >= 1; i--) {
            let dirs = colonyDirectives[i]; 
            if (dirs) {
                let reject = rejectDirectives[i]; 
                this.performDirectives(dirs, reject); 
                break; 
            }
        }
    }

    performDirectives(dirList, rejectList) {
        for (let dir of dirList) {
            let name = `${this.data.room}.directive.${dir}`; 
            if (this.startChildIfNotExist('directive.'+dir, name, {
                room: this.data.room 
            })) {
                this.log("Created " + dir + " directive for " + this.data.room); 
            }
        }
        for (let dir of rejectList) {
            let name = `${this.data.room}.directive.${dir}`; 
            if (this.killByName(name)) {
                this.log("Removed " + dir + " directive for " + this.data.room); 
            }
        }
    }

}

module.exports = ColonyProcess; 