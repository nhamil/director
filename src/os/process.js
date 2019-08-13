'use strict' 

/**
 * @typedef {import('./kernel').ProcessData} ProcessData 
 */
class Process {

    /**
     * @param {number} pid 
     * @param {ProcessData} pd 
     */
    constructor(pid, pd) {
        this._pid = pid; 
        this._pd = pd; 
        /**
         * Use this for any caching 
         */
        this.cache = {}; 
    }

    /**
     * @returns {number} The process ID 
     */
    get pid() {
        return this._pid; 
    }

    /**
     * @returns {string} The process name 
     */
    get name() {
        return this.constructor.name; 
    }

    /**
     * The data here must be stringifiable 
     * 
     * @returns The process memory
     */
    get data() {
        return this._pd.data; 
    }

    /**
     * @param data The new data to be stored 
     */
    set data(data) {
        return this._pd.data = data; 
    }

    /**
     * If a process has a description, it can override this getter to return it 
     * 
     * @returns {string} The process description 
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

    /**
     * Starts an independent process. 
     * If the id is already assigned a process and the process is 
     * still alive, the method does nothing 
     * 
     * @param {string} id Process identifier, this is not used by the resulting process. If this is null the process is not remembered  
     * @param {string} path Path to the process class
     * @param {object} args Process arguments 
     * @returns {boolean} Whether the process is created 
     */
    startProcess(id, path, args) {
        if (id) {
            if (!this.data._p) {
                this.data._p = {}; 
            }
            if (!this.data._p[id] || !kernel.alive(this.data._p[id])) {
                let pid = kernel.start(path, args);  
                if (pid > 0) {
                    this.data._p[id] = pid; 
                    return true; 
                }
            }
            return false; 
        }
        else {
            return kernel.start(path, args) > 0; 
        }
    }

    /**
     * Starts a child process. 
     * If the id is already assigned a process and the process is 
     * still alive, the method does nothing 
     * 
     * @param {string} id Process identifier, this is not used by the resulting process. If this is null the process is not remembered  
     * @param {string} path Path to the process class
     * @param {object} args Process arguments 
     * @returns {boolean} Whether the process is created 
     */
    startChildProcess(id, path, args) {
        if (id) {
            if (!this.data._p) {
                this.data._p = {}; 
            }
            if (!this.data._p[id] || !kernel.alive(this.data._p[id])) {
                let pid = kernel.start(path, args, this.pid);  
                if (pid > 0) {
                    this.data._p[id] = pid; 
                    return true; 
                }
            }
            return false; 
        }
        else {
            return kernel.start(path, args, this.pid) > 0; 
        }
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
