/**
 * Screeps Operating System Kernel
 */
'use strict' 

require('./constants'); 

const Process = require('./process'); 
const Scheduler = require('./scheduler'); 

/**
 * @typedef ProcessData 
 * @property {string} path File path to process
 * @property {string} [desc] Process description 
 * @property {Object} data Process JSON data 
 * @property {number} cpu Current CPU used
 * @property {number} max Maximum CPU used
 * @property {number[]} hist CPU usage history 
 * @property {number} stat Process status 
 * @property {number} [sleep] When to stop sleeping 
 * @property {number} pri Process priority 
 * @property {number} [ppid] PID of process' parent 
 * @property {number[]} [children] List of child processes 
 * 
 * @typedef KernelMemory 
 * @property {Object<string, ProcessData>} processes Table of PIDs to process data
 * @property {Object<number, number[]} queues PID queues
 * @property {number[]} sleep Sleeping PIDs
 * @property {number[]} completed PIDs that finished running for the tick 
 * @property {number[]} frame PIDs that ran this tick, but are not done 
 * @property {number} running Current running PID
 * @property {boolean} hitWall Whether the queue wall was hit this frame 
 */

class Kernel {

    constructor() {
        if (!Memory.os) {
            Memory.os = {
                processes: {}, 
                queues: {}, 
                sleep: [], 
                completed: [], 
                frame: [], 
                running: 0, 
                hitWall: false 
            };

            for (let p = PRIORITY_HIGHEST; p <= PRIORITY_LOWEST; p++) {
                Memory.os.queues[p] = []; 
            }
        }

        /**
         * @type {KernelMemory} 
         */
        this.__memory = Memory.os; 
        /**
         * @type {Scheduler} 
         */
        this.__scheduler = new Scheduler(this); 
    }

    /**
     * Base class for all processes. 
     * Extend this to create a process
     * 
     * Process logic is called by three methods: 
     * 
     * `create(args)` - When the process is created 
     * 
     * `reload()` - When the process is created (after `create`) and when the scripts 
     *     are reloaded 
     * 
     * `run()` - Called every time the process is run (normally every tick) 
     */
    get Process() {
        return Process; 
    }

    /**
     * The number of processes in the kernel 
     */
    get processCount() {
        return _.size(this.__memory.processes); 
    }

    /**
     * Number of times processes were run this tick 
     */
    get runCount() {
        return this.__scheduler.runCount; 
    }

    /**
     * The currently running PID
     */
    get running() {
        return this.__memory.running || 0; 
    }

    /**
     * Whether processes past the priority wall were run 
     */
    get hitWall() {
        return this.__memory.hitWall; 
    }

    /**
     * Maximum target CPU for the tick 
     */
    get cpuLimit() {
        return this.__scheduler.cpuLimit; 
    }

    /**
     * Formatted table of all processes 
     */
    get pidTable() {
        let out = ''; 

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
            let sum = 0; 

            let arr = mem || []; 
            for (let val of arr) {
                sum += parseFloat(val); 
            }

            if (arr.length) sum /= arr.length; 
            return sum.toFixed(2); 
        }

        out += ' pid  | name                 | pri | status | ppid | cur cpu | avg cpu | max cpu | description                      \n'; 
        out += '------+----------------------+-----+--------+------+---------+---------+---------+----------------------------------\n'; 

        const pids = _.keys(this.__memory.processes); 

        pids.sort((a, b) => 
            this.__memory.processes[b].cpu - this.__memory.processes[a].cpu
        ); 

        for (let pid of pids) {
            const mem = this.__memory.processes[pid]; 
            out += ' '; 
            out += padStart(pid, 4); 
            out += ' | '; 
            out += pad(mem.path.replace(/process_/g, ''), 20); 
            out += ' | '; 
            out += padStart(mem.pri, 3); 
            out += ' | '; 
            out += pad(STATUS_NAME[mem.stat || STATUS_NEXIST], 6); 
            out += ' | '; 
            out += padStart(mem.ppid | 0, 4); 
            out += ' | '; 
            out += padStart(mem.cpu ? parseFloat(mem.cpu).toFixed(2) : 0, 7); 
            out += ' | '; 
            out += padStart(avgCpu(mem.hist) || 0, 7); 
            out += ' | '; 
            out += padStart((parseFloat(mem.max) || 0).toFixed(2), 7); 
            out += ' | '; 
            out += pad(mem.desc || '(none)', 32); 
            out += '\n'; 
        }

        return out; 
    }

    /**
     * Determines process status 
     * 
     * @param {number} pid 
     * @returns {number} Status code for PID 
     */
    status(pid) {
        return this.__scheduler.getPidStatus(pid); 
    }

    /**
     * Determines whether a process is alive or not 
     * 
     * @param {number} pid 
     * @returns {boolean} Whether the process is alive 
     */
    alive(pid) {
        return this.__scheduler.isPidAlive(pid); 
    }

    /**
     * Creates and starts a new process 
     * 
     * @param {string} path Path to the process code 
     * @param {Object} [args] Any arguments for the process 
     * @param {number} ppid Parent PID if the process is a child 
     * @returns {number} The child PID or -1 if creation failed
     */
    start(path, args = null, ppid = 0) {
        return this.__scheduler.createProcess(path, args, ppid); 
    }

    /**
     * Kills a process and its children 
     * 
     * @param {number} pid PID of the process to kill 
     */
    kill(pid) {
        return this.__scheduler.killProcess(pid); 
    }

    /**
     * Sleeps a process for the given amount of ticks 
     * 
     * @param {number} pid PID of the process to sleep 
     * @param {number} ticks Number of ticks to sleep for 
     */
    sleep(pid, ticks = 1) {
        return this.__scheduler.sleepProcess(pid, ticks); 
    }

    /**
     * Only to be used by `main.js`. 
     * 
     * Runs the kernel for one tick. 
     */
    __run() {
        console.log('Time: ' + Game.time); 
        __setMemory(this); 

        if (this.processCount === 0) {
            this.start('../process/main'); 
        }

        this.__scheduler.preRun(); 
        this.__scheduler.scheduleCompletedProcesses(); 
        while (this.__scheduler.shouldContinue()) {
            this.__scheduler.runNextProcess(); 
        }
        this.__scheduler.shiftQueues(); 

        this.__scheduler.postRun(); 
    }

    /**
     * Only to be used by the console 
     * 
     * Resets all OS memory 
     */
    __reset() {
        delete Memory.os; 
        kernel = new Kernel(); 

        return 'Resetting the Kernel'; 
    }

}

function __setMemory(kernel) {
    kernel.__memory = Memory.os; 
}

module.exports = Kernel; 
