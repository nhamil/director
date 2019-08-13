'use strict'

/**
 * @typedef {import('./kernel').ProcessData} ProcessData 
 * @typedef {import('./kernel').KernelMemory} KernelMemory 
 */
class Scheduler {

    /**
     * @param {import('./kernel')} kernel 
     */
    constructor(kernel) {
        this._kernel = kernel; 
        /**
         * @type {Object<number, Process>} 
         */
        this.procCache = {}; 
        this.runCount = 0; 
    }

    get memory() {
        return this._kernel.__memory; 
    }

    /**
     * @param {string} path 
     * @returns {ProcessData} 
     */
    createProcessData(path) {
        return {
            path: path, 
            data: {}, 
            cpu: 0, 
            max: 0, 
            hist: [], 
            stat: STATUS_ACTIVE, 
            pri: PRIORITY_DEFAULT  
        }; 
    }

    createProcess(path, args, ppid = PID_NONE) {
        if (ppid) {
            if (!this.isPidAlive(ppid)) {
                // parent must be valid and alive 
                return PID_INVALID; 
            }
        }

        // this should be valid as long as there is a ppid provided 
        let parent = this.memory.processes[ppid]; 

        const pid = this.getFreePid(); 

        if (!pid) {
            throw 'Could not generate a PID for new process: there are too many processes'; 
        }

        try {
            const type = require(path); 
            const pd = this.createProcessData(path); 

            const proc = this._instantiateProcess(pid, pd); 
            proc.create(args !== undefined ? args : {}); 

            if (proc.priority !== undefined) pd.pri = proc.priority; 
            if (proc.description) pd.desc = proc.description; 

            this.memory.queues[pd.pri].push(pid); 
            this.memory.processes[pid] = pd; 

            if (ppid) {
                parent.children = parent.children || []; 
                parent.children.push(pid); 
                pd.ppid = ppid; 
            }

            return pid; 
        }
        catch (e) {
            console.log('Error creating process "' + path + '": ' + e); 
        }

        return PID_INVALID; 
    }

    /**
     * @param {number} pid 
     */
    getOrReloadProcess(pid) {
        const pd = this.memory.processes[pid]; 

        if (pd) {
            if (!this.procCache[pid]) {
                const proc = this._instantiateProcess(pid, pd); 
                proc.reload(); 

                this.procCache[pid] = proc; 
            }

            return this.procCache[pid]; 
        }

        return null; 
    }

    /**
     * @param {number} pid 
     * @param {ProcessData} pd 
     * @returns {Process} 
     */
    _instantiateProcess(pid, pd) {
        try {
            const type = require(pd.path); 
            return new type(pid, pd); 
        }
        catch (e) {
            throw 'Could not instantiate process ' + pid + ': ' + e; 
        }
    }

    _randomPid() {
        return Math.floor(Math.random() * (1 + PID_MAX - PID_MIN)) + PID_MIN; 
    }

    getFreePid() {
        let pid = this._randomPid(); 
        const start = pid; 
        do {
            if (pid > PID_MAX) pid = 1; 

            if (!this.doesPidExist(pid)) {
                return pid; 
            }
            else {
                pid++; 
            }
        } 
        while (pid !== start); 

        return PID_INVALID; 
    }

    isValidPid(pid) {
        return typeof pid === 'number' && pid >= PID_MIN && pid <= PID_MAX; 
    }

    /**
     * @param {number} pid 
     */
    doesPidExist(pid) {
        return this.getPidStatus(pid) !== STATUS_NEXIST; 
    }

    getPidStatus(pid) {
        const pd = this.memory.processes[pid]; 

        if (pd) {
            return pd.stat; 
        }
        else {
            return STATUS_NEXIST; 
        }
    }

    isPidAlive(pid) {
        const status = this.getPidStatus(pid); 

        return status === STATUS_ACTIVE || status === STATUS_SLEEP; 
    }

    /**
     * Get the process that will run next 
     * 
     * @param {boolean} peek Whether the pid should be kept in the queue
     * @returns {number} The next process to run 
     */
    getNextPidInQueue(peek = false) {
        for (let p = PRIORITY_HIGHEST; p <= PRIORITY_LOWEST; p++) {
            const queue = this.memory.queues[p]; 

            if (!peek && p >= PRIORITY_WALL) this.memory.hitWall = true; 

            while (queue && queue.length) {
                const pid = peek ? queue[0] : queue.shift(); 

                if (this.isPidAlive(pid)) {
                    return pid; 
                }
                else {
                    console.log('Removing old PID ' + pid + ' from queue ' + p); 
                    if (peek) queue.shift(); 
                }
            }
        }

        return PID_INVALID; 
    }

    killProcess(pid) {
        const pd = this.memory.processes[pid]; 

        if (pd) {
            if (pd.ppid && this.isPidAlive(pd.ppid)) {
                let ppd = this.memory.processes[pd.ppid]; 
                if (ppd.children) {
                    let index = ppd.children.indexOf(pid); 
                    if (index >= 0) {
                        ppd.children.splice(index, 1); 
                    }
                }
            }
            pd.stat = STATUS_KILL; 
            if (pd.children) {
                for (let child of pd.children) {
                    this.killProcess(child); 
                }
            }

            return true; 
        }

        return false; 
    }

    sleepProcess(pid, ticks) {
        if (this.isPidAlive(pid)) {
            const pd = this.memory.processes[pid]; 
            pd.stat = STATUS_SLEEP; 
            pd.sleep = Game.time + ticks; 
            return true; 
        }
        return false; 
    }

    runNextProcess() {
        this.runCount++; 
        const startCpu = Game.cpu.getUsed(); 
        const pid = this.getNextPidInQueue(); 
        if (!this.isPidAlive(pid)) return; 
        // this.memory.completed.push(pid); 

        let status = this.getPidStatus(pid); 
        const pd = this.memory.processes[pid]; 
        const path = pd.path; 
        const proc = this.getOrReloadProcess(pid); 

        let toQueue = false; 

        // console.log('Running ' + pid); 

        function runFunction() {
            proc.run(); 
        }

        function runCoroutine() {
            // console.log('Running coroutine'); 
            /** @type {GeneratorFunction} */
            let coroutine = proc.__coroutine; 
            if (!coroutine) {
                // console.log('Coroutine does not exist, starting one'); 
                coroutine = proc.__coroutine = proc.run(); 
            }
            let output;
            try {
                output = coroutine.next(); 
            }
            catch (e) {
                console.log('Error running coroutine process ' + pid + ' (' + path + '): ' + e); 
                proc.__coroutine = null; 
            }
            // console.log('Output: ' + JSON.stringify(output)); 
            if (output) {
                if (output.done) {
                    // console.log('Finished coroutine'); 
                    proc.__coroutine = null; 
                }
                else {
                    // console.log('Re-queueing process'); 
                    toQueue = true; 
                }
            }
        }

        if (!pd) {
            console.log('Could not find process data for ' + pid); 
            return; 
        }
        this.memory.running = pid; 

        // console.log('PID ' + pid + ': ' + STATUS_NAME[status]); 
        try {
            if (status === STATUS_SLEEP) {
                if (!pd.sleep || pd.sleep < Game.time) {
                    delete pd.sleep; 
                    status = pd.stat = STATUS_ACTIVE; 
                }
            }

            if (status === STATUS_ACTIVE) {
                proc._pd = pd; 
                let fnType = proc.run.constructor.name; 

                if (fnType == 'GeneratorFunction') {
                    runCoroutine(); 
                }
                else if (fnType == 'Function') {
                    runFunction(); 
                }
            }
        }
        catch (e) {
            console.log('Error running pid ' + pid + ' (' + path + '): ' + e.stack); 
        }

        if (toQueue) {
            let priority = pd.pri == undefined ? PRIORITY_DEFAULT : pd.pri; 
            // this.memory.queues[priority].push(pid); 
            this.memory.frame.push(pid); 
        }
        else {
            this.memory.completed.push(pid); 
        }

        const endCpu = Game.cpu.getUsed(); 
        const cpuTime = endCpu - startCpu; 
        pd.cpu += cpuTime; 
        pd.cpu = parseFloat(pd.cpu.toFixed(2));
        if (!pd.max || pd.max < pd.cpu) pd.max = pd.cpu; 
    }

    _queueFrameTasks() {
        // this.memory.frame = _.shuffle(_.uniq(this.memory.frame)); 
        if (this._lastTime != Game.time) {
            this._lastTime = Game.time; 
            // console.log('queueing frame tasks: ' + this.memory.frame); 
        }
        for (let pid of this.memory.frame) {
            let pd = this.memory.processes[pid]; 
            if (pd && pd.pri >= PRIORITY_HIGHEST && pd.pri <= PRIORITY_LOWEST) {
                this.memory.queues[pd.pri].push(pid); 
            }
        }
        this.memory.frame = []; 
    }

    shouldContinue() {
        // console.log('next pid: ' + this.getNextPidInQueue(true) + ", alive: " + this.isPidAlive(this.getNextPidInQueue(true))); 
        if (!this.isPidAlive(this.getNextPidInQueue(true))) {
            this._queueFrameTasks(); 
            if (!this.isPidAlive(this.getNextPidInQueue(true))) return false; 
        }

        if (Game.rooms['sim']) {
            return true; 
        }
        else {
            if (Game.cpu.getUsed() >= (this.cpuLimit || 10) - 1) {
                // console.log('Reached CPU Limit'); 
                return false; 
            }
            return true; 
        }
    }

    shiftQueues() {
        for (let p = PRIORITY_HIGHEST; p <= PRIORITY_LOWEST - 1; p++) {
            // don't let background tasks become too high priority 
            if (p === PRIORITY_WALL - 1) continue; 

            this.memory.queues[p] = this.memory.queues[p].concat(this.memory.queues[p + 1]); 
            this.memory.queues[p + 1] = []; 
        }
    }

    scheduleCompletedProcesses() {
        this.memory.completed = _.shuffle(_.uniq(this.memory.completed)); 

        for (let pid of this.memory.completed) {
            if (!this.isPidAlive(pid)) {
                continue; 
            }

            const proc = this.getOrReloadProcess(pid); 

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

    preRun() {
        this.cpuLimit = Math.ceil(Math.min(Game.cpu.limit * Game.cpu.bucket / 9000, Game.cpu.tickLimit - 10)); 
        this.runCount = 0; 
        this.memory.hitWall = false; 
        this.memory.frame = []; 

        for (let pid in this.memory.processes) {
            const mem = this.memory.processes[pid]; 

            mem.cpu = 0; 

            if (mem.kill) {
                delete this.memory.processes[pid]; 
            }
        }
    }

    _queueLostProcesses() {
        let queued = {}; 

        for (let pid of this.memory.completed) {
            queued[pid] = true; 
        }
        for (let pri in this.memory.queues) {
            for (let pid of this.memory.queues[pri]) {
                queued[pid] = true; 
            }
        }

        for (let pid in this.memory.processes) {
            if (this.isPidAlive(pid) && !queued[pid]) {
                console.log('Lost PID: ' + pid); 
                this.memory.completed.push(pid); 
            }
        }
    }

    postRun() {
        this.memory.completed = this.memory.completed.concat(this.memory.frame); 
        this.memory.frame = []; 

        this._queueLostProcesses(); 

        for (let pid in this.memory.processes) {
            if (this.isPidAlive(pid)) {
                const mem = this.memory.processes[pid]; 

                mem.hist = mem.hist || []; 
                mem.hist.push(mem.cpu || 0); 
                mem.max = Math.max(mem.cpu, mem.max); 
                if (mem.hist.length > 10) mem.hist.shift(); 
            }
            else {
                delete this.memory.processes[pid]; 
                delete this.procCache[pid]; 
            }
        }
    }

}

module.exports = Scheduler; 
