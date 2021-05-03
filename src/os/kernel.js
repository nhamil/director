'use strict' 

const Process = require('./process'); 
const spawnQueue = require('../spawnqueue'); 

/**
 * @typedef ProcessData 
 * @property {Object} data JSON data for process  
 * @property {string} name Process name 
 * @property {number} stat Process status 
 * @property {number} ppid Parent PID 
 * @property {number} pri Priority 
 * @property {number} cpri Current priority 
 * @property {number} [wake] Time to wake 
 * @property {number} cpu Current CPU usage 
 * @property {number} max Maximum CPU used 
 * @property {number[]} hist CPU usage history (last 4 ticks)
 * @property {number} [imp] Whether this process is important and must run
 * 
 * @typedef KernelMemory 
 * @property {Object<number, ProcessData>} procs Mapping of PIDs to process data 
 * @property {number} cur Currently running PID 
 * 
 * @typedef KernelCache 
 * @property {Object<number, Process>} procs Mapping of PIDs to process object 
 * @property {Object<string, number>} procsByName Mapping of process names to PIDs
 */

const processTypes = require('./paths'); 

function reset(removeMem = false) {
    if (removeMem) delete Memory.os; 

    let welcome = String.raw` _____ _____ _____  ______ _____ _______ ____  _____  
|  __ \_   _|  __ \|  ____/ ____|__   __/ __ \|  __ \ (R)
| |  | || | | |__) | |__ | |       | | | |  | | |__) |
| |  | || | |  _  /|  __|| |       | | | |  | |  _  / 
| |__| || |_| | \ \| |___| |____   | | | |__| | | \ \ 
|_____/_____|_|  \_\______\_____|  |_|  \____/|_|  \_\ ` + '\n\n';
    console.log("Initializing..."); 
    console.log(welcome); 

    /** 
     * @typedef {import('./kernel')} Kernel
     * @type {Kernel} 
     */
    let kernel = new Kernel(); 
    global.kernel = kernel; 
    
    kernel._updateMemory(); 

    /**
     * @type {KernelCache} 
     */
    kernel._cache = {
        procs: {}, 
        procsByName: {}
    }; 
    kernel._regenerateProcesses(); 

    console.log("Initialization complete!"); 
    console.log(); 

    return true; 
}

class Kernel {

    constructor() {
        this._updateMemory(); 

        // /**
        //  * @type {KernelCache} 
        //  */
        // this._cache = {
        //     procs: {}, 
        //     procsByName: {}
        // }; 
        // this._regenerateProcesses(); 
    }

    __reset() {
        return reset(true); 
    }

    _regenerateProcesses() {
        console.log(`Regenerating...`);
        let toKill = [] 

        for (let pid in this._memory.procs) {
            if (!(this._cache.procs[pid])) {
                // console.log(`Regenerating PID ${pid}`);
                let procData = this._memory.procs[pid]; 

                let proc = this._newProcess(pid, procData); 

                if (proc == null) {
                    console.log(`Failed to regenerate ${pid}`); 
                    toKill.push(pid); 
                }
                else {
                    this._cache.procs[pid] = proc; 
                    this._cache.procsByName[procData.name] = pid; 
                }
            }
        }

        for (let i = 0; i < toKill.length; i++) {
            this.kill(toKill[i]); 
        }
    }

    /**
     * @param {number} pid 
     * @param {ProcessData} procData 
     * @returns 
     */
    _newProcess(pid, procData, create=null) {
        try {
            let procClass = processTypes[procData.path]; 

            if (!(procClass)) {
                console.log("Could not find process path for '" + procData.path + "', killing process"); 
                return null; 
            }

            /** @type {Process} */
            let proc = new procClass(pid, procData); 
            if (create) {
                proc.create(create); 
            }
            proc.reload(); 
            return proc; 
        }
        catch (e) {
            console.log("Could not create process instance for '" + procData.path + "', killing process: " + e); 
            return null; 
        }
    }

    top(topN = 10) {
        let out = ""; 

        function pad(str, amt) {
            if (str === undefined) str = ''; 
            str = str.toString(); 
            return str.padEnd(amt, ' ').slice(0, amt); 
        }

        function padStart(str, amt) {
            if (str === undefined) str = ''; 
            str = str.toString().padStart(amt, ' '); 
            return str.slice(0, amt); 
        }

        function avgCpu(mem) {
            let sum = parseFloat(mem.cpu); 

            let arr = mem.hist || []; 
            for (let val of arr) {
                sum += parseFloat(val); 
            }

            sum /= (arr.length + 1); 
            return (sum/1000).toFixed(2); 
        }

        let pids = _.keys(this._memory.procs); 
        pids.sort((a, b) => 
            parseFloat(this._memory.procs[b].cpu) - parseFloat(this._memory.procs[a].cpu)
        ); 

        let memKb = RawMemory.get().length * 1 / 1024; 
        let mem = memKb / 2048; 
        let cpu = Game.cpu.getUsed() * 1.0 / Game.cpu.limit; 
        let bucket = Game.cpu.bucket / 10000; 

        // out += "CPU       : " + Game.cpu.getUsed().toFixed(2) + " / " + Game.cpu.limit.toFixed(2) + " \n"; 
        // out += "Bucket    : " + Game.cpu.bucket.toFixed(2) + " / " + (10000).toFixed(2) + " \n"; 
        // out += "Processes : " + _.size(pids) + " \n"; 

        let length = 50;

        out += 'CPU : ['; 
        for (let i = 0; i < length; i++) {
            out += i < cpu * length ? '|' : '.'; 
        }
        out += '] ' + (cpu*100).toFixed(2) + '%\n'; 
        out += 'MEM : ['; 
        for (let i = 0; i < length; i++) {
            out += i < mem * length ? '|' : '.'; 
        }
        out += '] ' + memKb.toFixed(2) + ' kb\n'; 
        out += 'BUK : ['; 
        for (let i = 0; i < length; i++) {
            out += i < bucket * length ? '|' : '.'; 
        }
        out += '] ' + Game.cpu.bucket + ' ms\n'; 

        out += '\n'; 

        out += "Processes : " + _.size(pids) + " \n\n"; 

        out += "pid   | name                           | pri | imp | status | ppid  | cur cpu | avg cpu | max cpu\n"; 
        out += "------+--------------------------------+-----+-----+--------+-------+---------+---------+--------\n";

        let i = 0; 
        for (let pid of pids) {
            if (topN > 0 && i >= topN) break; 
            i++; 
            let mem = this._memory.procs[pid]; 

            out += padStart(pid, 5); 
            out += ' | '; 
            out += pad(mem.name, 30); 
            out += ' | '; 
            out += padStart(mem.pri, 3); 
            out += ' | '; 
            out += padStart(mem.imp || 0, 3); 
            out += ' | '; 
            out += pad(STATUS_NAME[mem.stat || STATUS_NEXIST], 6); 
            out += ' | '; 
            out += padStart(mem.ppid, 5); 
            out += ' | '; 
            out += padStart((parseFloat(mem.cpu)/1000).toFixed(2), 7); 
            out += ' | '; 
            out += padStart(avgCpu(mem), 7); 
            out += ' | '; 
            out += padStart((parseFloat(mem.max)/1000).toFixed(2), 7); 
            out += '\n'; 
        }

        return out; 
    }

    /**
     * Get process status
     * 
     * @param {number} pid Process ID
     */
    status(pid) {
        let p = this._memory.procs[pid]; 

        if (p) {
            return p.stat; 
        }
        else {
            return STATUS_NEXIST; 
        }
    } 

    /**
     * @param {number} pid Process ID
     * @returns {boolean} Whether process is alive or not 
     */
    alive(pid) {
        let s = this.status(pid); 
        return s != STATUS_NEXIST && s != STATUS_KILL; 
    }

    /**
     * @param {number} pid Process ID 
     * @param {boolean} now Wake on this tick 
     */
    wake(pid, now = false) {
        if (this.alive(pid)) {
            let proc = this._cache.procs[pid]; 
            let procData = this._memory.procs[pid]; 

            procData.stat = STATUS_ACTIVE; 
            delete procData.wake; 

            if (now) {
                proc._complete = false; 
            }

            return true; 
        }

        return false; 
    }

    defer(pid) {
        return this.wake(pid, true); 
    }

    /**
     * @param {number} pid 
     * @param {number} ticks 
     */
    sleep(pid, ticks) {
        if (this.alive(pid)) {
            let targetTime = Game.time + Math.floor(ticks + 1); 

            if (targetTime > Game.time) {
                let procData = this._memory.procs[pid]; 
                procData.stat = STATUS_SLEEP; 
                procData.wake = targetTime; 
            }

            return true; 
        }

        return false; 
    }

    /**
     * @param {number} pid 
     */
    suspend(pid) {
        if (this.alive(pid)) {
            let procData = this._memory.procs[pid]; 
            procData.stat = STATUS_SUSPEND; 
            return true; 
        }

        return false; 
    }

    /**
     * @param {number} ppid Parent
     * @param {number} pid Child
     * @returns {boolean} If pid is a child of parent 
     */
    hasChildProcess(ppid, pid) {
        if (this.alive(pid)) {
            return this._memory.procs[pid].ppid === ppid; 
        }
        else {
            return false; 
        }
    }

    /**
     * @param {string} name 
     * @returns {number} 
     */
    getPidByName(name) {
        let pid = this._cache.procsByName[name]; 

        if (pid) {
            return pid; 
        }
        else {
            return PID_NONE; 
        }
    }

    data(pid) {
        if (this.alive(pid)) {
            return this._memory.procs[pid].data; 
        }
    }

    killByName(name) {
        return this.kill(this.getPidByName(name)); 
    }

    /**
     * Kills a process and all its children
     * 
     * @param {number} pid Process ID 
     */
    kill(pid) {
        if (this.alive(pid)) {
            for (let p in this._memory.procs) {
                let pd = this._memory.procs[p]; 
                if (pd.ppid == pid) {
                    kernel.kill(p); 
                }
            }

            try {
                this._cache.procs[pid].destroy(); 
            }
            catch (e) {} 

            let procData = this._memory.procs[pid]; 
            procData.stat = STATUS_KILL; 
            delete this._cache.procsByName[procData.name]; 
            delete this._cache.procs[pid]; 
            delete this._memory.procs[pid]; 
            
            return true; 
        }

        return false; 
    }

    /**
     * Create and start a process
     * 
     * @param {string} path Path to process
     * @param {Object} params Any creation parameters 
     */
    start(path, name, ppid = 1, params = null) {
        if (this.alive(ppid)) {
            if (name in this._cache.procsByName) {
                return PID_NONE; 
            }

            let pid = this._getFreePid(); 
            if (!pid) {
                return PID_NONE; 
            }
            let procData = this._createProcessData(path, name, ppid, STATUS_ACTIVE); 
            this._memory.procs[pid] = procData; 

            params = params || {}; 
            let proc = this._newProcess(pid, procData, params); 

            if (proc) {
                this._cache.procs[pid] = proc; 
                this._cache.procsByName[procData.name] = pid; 
                this._checkQueue = true; 
                return pid; 
            }
            else {
                delete this._memory.procs[pid]; 
            }
        }

        return PID_NONE; 
    }

    /**
     * @param {string} path 
     * @param {string} name 
     * @param {number} ppid 
     * @param {number} stat 
     * @param {number} pri 
     * @returns {ProcessData} 
     */
    _createProcessData(path, name, ppid, stat) {
        return {
            data: {}, 
            path: path, 
            name: name, 
            ppid: ppid, 
            stat: stat, 
            pri: PRIORITY_DEFAULT, 
            cpri: PRIORITY_DEFAULT, 
            cpu: 0, 
            max: 0, 
            hist: []
        }
    }

    _randomPid() {
        return Math.floor(Math.random() * (1 + PID_MAX - PID_MIN)) + PID_MIN; 
    }

    _getFreePid() {
        let pid = this._randomPid(); 
        const start = pid; 
        do {
            if (pid > PID_MAX) pid = 2; 

            if (!this.alive(pid)) {
                return pid; 
            }
            else {
                pid++; 
            }
        } 
        while (pid !== start); 

        return PID_INVALID; 
    }

    _updateMemory() {
        if (!Memory.os) {
            Memory.os = {
                procs: {}, 
                cur: PID_NONE 
            }; 
        }

        this._checkQueue = true; 
        this._processTypes = processTypes; 

        /**
         * @type {KernelMemory} 
         */
        this._memory = Memory.os; 
    }

    _preRun() {
        spawnQueue.clear(); 

        for (let pid in this._cache.procs) {
            try {
                let procData = this._memory.procs[pid]

                if (procData.max != 0) {
                    procData.hist.push(procData.cpu); 
                    if (procData.hist.length > 4) {
                        procData.hist.splice(0, procData.hist.length - 4); 
                    }
                }

                procData.cpu = 0; 
                this._cache.procs[pid]._complete = false; 
            }
            catch (e) {
                console.log("Error during pre-run: " + e); 
            }
        }
    } 

    _postRun() {
        for (let pid in this._cache.procs) {
            try {
                let procData = this._memory.procs[pid]; 

                if (procData.cpu > procData.max) {
                    procData.max = procData.cpu; 
                } 
            }
            catch (e) {
                console.log("Error during post-run: " + e); 
            }
        }
    } 

    _runProc(pid) {
        let proc = this._cache.procs[pid]; 
        let procData = this._memory.procs[pid]; 

        let startTime = Game.cpu.getUsed(); 

        function timeUsed() {
            return Math.floor((Game.cpu.getUsed() - startTime) * 1000); 
        }

        if (!this.alive(pid)) return false; 

        try {
            if (proc._complete) return false; 
            procData.cpri = procData.pri; 
            proc._complete = true; 

            if (procData.stat === STATUS_SLEEP) {
                if (procData.wake <= Game.time) {
                    procData.stat = STATUS_ACTIVE; 
                    delete procData.wake; 
                }
            }

            if (procData.stat === STATUS_ACTIVE) {
                proc._pd = this._memory.procs[pid]; 
                proc.run(); 
                procData.cpu += timeUsed(); 
                return true; 
            }
            
            return false; 
        }
        catch (e) {
            try {
                procData.cpu += timeUsed(); 
                proc._complete = true; 
            }
            catch (e) {} 
            console.log("Error running " + pid + ": " + e + "\n" + e.stack); 
            this.kill(pid); 
        }

        return true; 
    } 

    _genQueue() {
        /** @type {string[]} */
        this._queue = _.keys(this._memory.procs); 
        this._queue.sort((a, b) => 
            this._memory.procs[a].cpri - this._memory.procs[b].cpri
        ); 
        this._checkQueue = false; 
    }

    shouldContinue() {
        return Game.cpu.getUsed() < Game.cpu.limit; 
    }

    /**
     * Run processes for one tick
     */
    run() {
        this._updateMemory(); 

        if (this.status(1) === STATUS_NEXIST) {
            let procData = this._createProcessData(
                'init', 
                'init', 
                PID_NONE, 
                STATUS_ACTIVE
            );

            let pid = 1; 
            this._memory.procs[pid] = procData; 
            this._cache.procs[pid] = this._newProcess(pid, procData, {}); 
            this._checkQueue = true; 
        }

        this._preRun();

        let anyRan = true; 
        while (anyRan) {
            this._genQueue(); 
            anyRan = false; 
            let unimportant = false; 

            let i = 0; 
            for (; i < this._queue.length; i++) {
                let pid = this._queue[i]; 
                if (this.shouldContinue()) {
                    anyRan = this._runProc(pid) || anyRan; 
                    unimportant = true; 
                }
                else if (this._memory.procs[pid] && this._memory.procs[pid].imp) {
                    anyRan = this._runProc(pid) || anyRan; 
                }
                else {
                    break; 
                }
            }

            anyRan = anyRan || this._checkQueue; 

            if (unimportant) {
                // increase the priority of any process that did not run 
                for (; i < this._queue.length; i++) {
                    let pid = this._queue[i]; 
                    if (this.alive(pid)) this._memory.procs[pid].cpri = Math.max(0, this._memory.procs[pid].cpri - 1); 
                }
            }
        }

        this._postRun(); 
    }

}

Kernel.reset = reset; 

module.exports = Kernel; 