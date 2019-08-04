/**
 * Screeps Operating System Kernel
 */
'use strict' 

require('./constants'); 

const Process = require('./process'); 
const Scheduler = require('./scheduler'); 

/**
 * @typedef ProcessMemory 
 * @property {string} path
 * @property {string} desc  
 * @property {Object} data 
 * 
 * @typedef KernelMemory 
 * @property {Object<string, ProcessMemory>} processes 
 * @property {Object<number, number[]} queues 
 * @property {number[]} sleep
 * @property {number[]} completed 
 * @property {number} running  
 */

class Kernel {

    constructor() {
        // console.log('--------------------------------------------------'); 
        // console.log('TODO Kernel.init'); 
        // console.log('=============================================\n\n\n'); 

        if (!Memory.os) {
            Memory.os = {
                processes: {}, 
                queues: {}, 
                sleep: [], 
                completed: [], 
                frame: [] 
            };

            for (let p = PRIORITY_HIGHEST; p <= PRIORITY_LOWEST; p++) {
                Memory.os.queues[p] = []; 
            }

            Memory.os.running = 0; 
        }

        /**
         * @type {KernelMemory} 
         */
        this.__memory = Memory.os; 
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
     * The currently running PID
     */
    get running() {
        return this.__memory.running; 
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

        out += ' pid  | name                 | status | cur cpu | avg cpu | max cpu | description                      \n'; 
        out += '------+----------------------+--------+---------+---------+---------+----------------------------------\n'; 

        const pids = _.keys(this.__memory.processes); 

        pids.sort((a, b) => 
            this.__memory.processes[b].cur - this.__memory.processes[a].cur
        ); 

        for (let pid of pids) {
            const mem = this.__memory.processes[pid]; 
            out += ' '; 
            out += padStart(pid, 4); 
            out += ' | '; 
            out += pad(mem.path.replace(/process_/g, ''), 20); 
            out += ' | '; 
            out += pad(STATUS_NAME[mem.stat || STATUS_ACTIVE], 6); 
            out += ' | '; 
            out += padStart(mem.cur ? parseFloat(mem.cur).toFixed(2) : 0, 7); 
            out += ' | '; 
            out += padStart(avgCpu(mem.cpu) || 0, 7); 
            out += ' | '; 
            out += padStart((parseFloat(mem.max) || 0).toFixed(2), 7); 
            out += ' | '; 
            out += pad(mem.desc || '(none)', 32); 
            out += '\n'; 
        }

        return out; 
    }

    /**
     * Determines PID status 
     * 
     * @param {number} pid 
     * @return {number} Status code for PID 
     */
    status(pid) {
        return this.__scheduler.getPidStatus(pid); 
    }

    /**
     * Creates and starts a new process 
     * 
     * @param {string} path Path to the process code 
     * @param {Object} [args] Any arguments for the process 
     * @param {number} ppid Parent PID if the process is a child 
     */
    start(path, args = null, ppid = 0) {
        this.__scheduler.createProcess(path, args, ppid); 
    }

    /**
     * Kills a process and its children 
     * 
     * @param {number} pid PID of the process to kill 
     */
    kill(pid) {
        this.__scheduler.killProcess(pid); 
    }

    /**
     * Sleeps a process for the given amount of ticks 
     * 
     * @param {number} pid PID of the process to sleep 
     * @param {number} ticks Number of ticks to sleep for 
     */
    sleep(pid, ticks = 1) {
        this.__scheduler.sleepProcess(pid, ticks); 
    }

    /**
     * Only to be used by `main.js`. 
     * 
     * Runs the kernel for one tick. 
     */
    __run() {
        __setMemory(this); 

        if (this.processCount === 0) {
            this.start('../process/main'); 
        }

        this.__scheduler.prerun(); 
        this.__scheduler.scheduleCompletedProcesses(); 
        while (this.__scheduler.shouldContinue()) {
            this.__scheduler.runNextProcess(); 
        }
        // TODO add any processes that are completed, but ran in a previous frame

        this.__scheduler.cleanup(); 
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
