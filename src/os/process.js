'use strict' 

class Process {

    /**
     * @param {number} pid 
     * @param {Object} mem 
     */
    constructor(pid, mem) {
        this._pid = pid; 
        this._mem = mem; 
    }

    /**
     * The process ID 
     */
    get pid() {
        return this._pid; 
    }

    /**
     * The process name 
     */
    get name() {
        return this.constructor.name; 
    }

    /**
     * The process memory 
     * 
     * The data here must be stringifiable 
     */
    get data() {
        return this._mem.data; 
    }

    /**
     * @param {Object} data The new data to be stored 
     */
    set data(data) {
        return this._mem.data = data; 
    }

    /**
     * If a process has a description, it can override this getter to return it 
     * 
     * The process description 
     */
    get description() {
        return null; 
    }

    /**
     * If a process has a non-default priority, it can override this method to return it 
     * 
     * @returns {number} The process priority 
     */
    get priority() {
        return PRIORITY_DEFAULT; 
    }

    /**
     * Processes can override this to handle creation. 
     * 
     * This is only called once, even if the scripts are restarted 
     * 
     * @param {Object} args 
     */
    create(args) {} 

    /**
     * Processes can override this to handle creation. 
     * 
     * This is called when the process is created (after `create()`) and whenever 
     * the scripts are restarted 
     */
    reload() {} 

    /**
     * Processes can override this to handle process logic. 
     */
    run() {}

    startProcess(path, args) {
        kernel.start(path, args); 
    }

    startChildProcess(path, args) {
        kernel.start(path, args, this.pid); 
    }

    /**
     * Sleeps the process for a number of ticks 
     * 
     * @param {number} ticks Number of ticks to sleep for 
     */
    sleep(ticks) {
        kernel.sleep(this.pid, ticks); 
    }

    /**
     * Kills the process. 
     * 
     * Do NOT continue running after calling this
     */
    exit() {
        kernel.kill(this.pid); 
    }

}

module.exports = Process; 
