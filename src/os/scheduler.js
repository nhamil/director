'use strict'

class Scheduler {

    /**
     * @param {import('./kernel')} kernel 
     */
    constructor(kernel) {
        this._kernel = kernel; 
        /**
         * @type {Object<number, Process>} 
         */
        this.processes = {}; 
    }

    get memory() {
        return this._kernel.__memory; 
    }

    get MAX_PID() {
        return 10000; 
    }

    createProcess(path, args, ppid) {
        let pid = this.getFreePid(); 
        
        if (pid) {
            try {
                const type = require(path); 
                const mem = {
                    path: path, 
                    data: {}, 
                    cur: 0, 
                    max: 0, 
                    cpu: []
                }; 
                /** @type {Process} */
                const proc = this._instantiateProcess(path, pid, mem); 
                proc.create(args || {}); 
                const desc = proc.description; 
                if (desc) mem.desc = desc; 
                const priority = proc.priority; 
                // console.log('Pushing process on ' + priority + ' queue'); 
                this.memory.queues[priority].push(pid); 
                this.memory.processes[pid] = mem; 

                console.log('Creating process "' + path + '": ' + pid); 
            }
            catch (e) {
                console.log('Error creating process "' + path + '"'); 
            }
        }
        else {
            console.log('There are too many processes, cannot create another'); 
        }
    }

    _reloadProcess(pid) {
        const mem = this.memory.processes[pid]; 

        if (mem) {
            if (!this.processes[pid]) {
                const proc = this._instantiateProcess(mem.path, pid, mem); 
                proc.reload(); 

                this.processes[pid] = proc; 
            }

            return this.processes[pid]; 
        }

        return null; 
    }

    _instantiateProcess(path, pid, mem) {
        try {
            const type = require(path); 
            return new type(pid, mem); 
        }
        catch (e) {
            return null; 
        }
    }

    getFreePid() {
        let pid = Math.floor(Math.random() * this.MAX_PID); 
        let start = pid; 
        do {
            if (pid >= this.MAX_PID) pid = 1; 

            if (!this.doesPidExist(pid)) {
                return pid; 
            }
            else {
                pid++; 
            }
        } 
        while (pid !== start); 

        return 0; 
    }

    doesPidExist(pid) {
        return !!this.memory.processes[pid]; 
    }

    getPidStatus(pid) {
        if (!this.doesPidExist(pid)) return STATUS_NOT_EXIST; 

        const mem = this.memory.processes[pid]; 

        if (mem) {
            if (mem.kill) {
                return STATUS_KILL; 
            }
            else if (mem.sleep && mem.sleep > Game.time) {
                return STATUS_SLEEP; 
            }
            else {
                return STATUS_ACTIVE; 
            }
        }
        else {
            return STATUS_NOT_EXIST; 
        }
    }

    getProcess(pid) {
        if (this.doesPidExist(pid)) {
            let proc = this.processes[pid]; 

            if (!proc) {
                proc = this._reloadProcess(pid); 
            }

            return proc; 
        }
        else {
            return null; 
        }
    }

    /**
     * Get the process that will run next 
     * 
     * @param {boolean} peek Whether the pid should be kept in the queue
     * @returns {Process} The next process to run 
     */
    getNextProcess(peek = false) {
        for (let p = PRIORITY_HIGHEST; p < PRIORITY_LOWEST; p++) {
            const queue = this.memory.queues[p]; 

            let i = 0; 
            while (queue && queue.length && i < queue.length) {
                const pid = peek ? queue[i++] : queue.shift(); 

                if (this.doesPidExist(pid)) {
                    return this.getProcess(pid); 
                }
                else if (peek) {
                    this.memory.queues[p] = queue.splice(--i, 1); 
                }
            }
        }

        return null; 
    }

    killProcess(pid) {
        if (this.memory.processes[pid]) {
            this.memory.processes[pid].kill = true;
        }
    }

    sleepProcess(pid, ticks) {
        if (this.memory.processes[pid]) {
            this.memory.processes[pid].sleep = Game.time + ticks;
        }
    }

    runNextProcess() {
        const proc = this.getNextProcess(); 
        if (proc === null) return; 
        let pid = this.memory.running = proc.pid; 
        let path; 
        
        const mem = this.memory.processes[pid]; 

        if (mem) {
            mem.queued = false; 
            const start = Game.cpu.getUsed(); 
            if (mem.sleep && parseInt(mem.sleep) < Game.time) {
                delete mem.sleep; 
            }
            const status = this.getPidStatus(pid); 
            mem.stat = status; 
            if (status == STATUS_ACTIVE) {
                try {
                    proc._mem = this.memory.processes[pid]; 
                    path = proc._mem.path; 
                    proc.run(); 
                }
                catch (e) {
                    console.log('Error running PID ' + pid + ' ("' + path + '"): ' + e); 
                }
            }
            mem.cur = (Game.cpu.getUsed() - start).toFixed(2); 
            
            this.memory.running = 0; 
            this.memory.completed.push(pid); 
            // mem.queued = true; 
        }
        else {
            console.log('Tried to run process without process data: ' + pid); 
        }

    }

    shouldContinue() {
        if (this.getNextProcess(true) == null) return false; 

        if (Game.rooms['sim']) {
            // console.log('should continue: ' + this.getNextProcess(true)); 
            return this.getNextProcess(true) !== null; 
        }
        else {
            return Game.cpu.getUsed() < Game.cpu.limit; 
        }
    }

    scheduleCompletedProcesses() {
        for (let pid in this.memory.processes) {
            if (!this.memory.processes[pid].queued) {
                this.memory.completed.push(parseInt(pid)); 
            }
        }

        this.memory.completed = _.shuffle(_.uniq(this.memory.completed)); 

        for (let pid of this.memory.completed) {
            const proc = this.getProcess(pid); 

            if (proc) {
                const priority = proc.priority; 
                this.memory.queues[priority].push(pid); 
            }
            else {
                console.log('Process does not exist: ' + pid + ', cannot schedule'); 
            }
        }

        this.memory.completed.length = 0; 
    }

    prerun() {
        for (let pid in this.memory.processes) {
            const mem = this.memory.processes[pid]; 

            mem.cur = 0; 

            if (mem.kill) {
                delete this.memory.processes[pid]; 
            }
        }
    }

    cleanup() {
        for (let pid in this.memory.processes) {
            const mem = this.memory.processes[pid]; 

            mem.cpu = mem.cpu || []; 
            mem.cpu.push(mem.cur || 0); 
            mem.max = Math.max(parseInt(mem.cur), parseInt(mem.max)); 
            if (mem.cpu.length > 10) mem.cpu.shift(); 
        }
        for (let i in this.processes) {
            const proc = this.processes[i]; 
            if (!this.memory.processes[proc.pid]) {
                delete this.processes[i]; 
            }
        }
    }

}

module.exports = Scheduler; 
