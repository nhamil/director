'use strict' 

global.Director2 = module.exports; 

const priority = require('./priority'); 
const spawn = require('./spawn'); 
const stats = require('./stats'); 
const time = require('./time'); 

const GCDirective = require('./directives/GCDirective'); 
const MineDirective = require('./directives/MineDirective'); 
const SpawnDirective = require('./directives/SpawnDirective'); 
const UpgradeDirective = require('./directives/UpgradeDirective'); 

const MineTask = require('./tasks/MineTask'); 
const UpgradeTask = require('./tasks/UpgradeTask'); 
const WithdrawTask = require('./tasks/WithdrawTask'); 

const log = require('./log').createLogger('Director'); 

function genNameMap(list) {
    let out = {}; 

    for (let obj of list) {
        out[obj.name] = obj; 
    }

    return out; 
}

class Director {

    constructor() {
        if (!Game.rooms.sim) log.info('Initializing...'); 

        this.directives = [
            new UpgradeDirective(), 
            new MineDirective(), 
            new GCDirective() 
        ]; 

        this.tasks = [
            new MineTask(), 
            new UpgradeTask(), 
            new WithdrawTask()  
        ]; 
 
        priority.sort(this.directives); 
        // spawning should always happen last 
        this.directives.push(new SpawnDirective()); 
        this.taskMap = genNameMap(this.tasks); 

        log.debug('Directives: ' + this.directives); 
        log.debug('Tasks: ' + this.tasks); 
    }

    update() {
        stats.update(); log.info(stats.timePeriod); 
        
        spawn.clearRequests(); 
        this.updateDirectives(); 
        this.updateTasks(); 
        time.update(); 
    }

    updateDirectives() {
        for (let directive of this.directives) {
            this._updateDirective(directive, 'preUpdate'); 
        }
        for (let directive of this.directives) {
            this._updateDirective(directive, 'update'); 
        }
        for (let directive of this.directives) {
            this._updateDirective(directive, 'postUpdate'); 
        }
    }

    _updateDirective(dir, call) {
        try {
            dir[call](); 
        }
        catch (e) {
            log.error('Exception thrown while running "' + call + '" on directive "' + dir.name + '": '); 
            log.error(e.stack.replace(/ \(eval.*\), /g, '').replace(/ \(blob.*\)/g, '').replace(/\)/g, ''));  
        }
    }

    _updateTask(task, creep) {
        try {
            return task.update(creep, creep.memory.data); 
        }
        catch (e) {
            log.error('Exception thrown while running task "' + task.name + '" on creep "' + creep.name + '": '); 
            log.error(e.stack.replace(/ \(eval.*\), /g, '').replace(/ \(blob.*\)/g, '').replace(/\)/g, ''));  
            return true; 
        }
    }

    updateTasks() {
        for (let name in Game.creeps) {
            let creep = Game.creeps[name]; 
            if (!creep.my || creep.spawning) continue; 
            
            let taskName = creep.memory.task; 

            if (taskName) {
                let task = this.taskMap[taskName]; 

                if (task) {
                    creep.memory.data = creep.memory.data || {}; 
                    let done = this._updateTask(task, creep); 

                    if (done) {
                        delete creep.memory.task; 
                        delete creep.memory.data; 
                    }
                }
                else {
                    log.warn(creep.name + ' has unknown task: ' + taskName); 
                    delete creep.memory.task; 
                }
            }
            else {
                // log.warn(creep.name + ' is idle'); 
            }
        }
    }

}

module.exports = Director; 