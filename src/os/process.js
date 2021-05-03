'use strict' 

class Process {

    /**
     * @typedef {import('./kernel').ProcessData} ProcessData
     * @param {number} pid 
     * @param {ProcessData} pd 
     */
    constructor(pid, pd) {
        this._pid = pid; 
        this._pd = pd; 
        this._pd.pri = this.priority; 
        this._pd.cpri = this._pd.pri; 
        this._complete = false; 
        if (this.important) {
            this._pd.imp = 1; 
        }
    }

    get important() {
        return false; 
    }

    get priority() {
        return PRIORITY_DEFAULT; 
    }

    get pid() {
        return this._pid; 
    }

    get ppid() {
        return this._pd.ppid; 
    }

    get data() {
        return this._pd.data; 
    }

    get name() {
        return this._pd.name; 
    }

    get orphaned() {
        return this._pd.ppid === 1; 
    }

    log(x = "") {
        let lines = String(x).split("\n"); 
        let out = ""; 
        for (let line of lines) {
            out += '[' + this.name + '] ' + line + '\n'; 
        }
        console.log(out); 
    }

    hasChild(pid) {
        return kernel.hasChildProcess(this.pid, pid); 
    }

    startChild(path, name, data = null) {
        return kernel.start(path, name, this.pid, data); 
    }

    startChildIfNotExist(path, name, data = null) {
        if (!kernel.getPidByName(name)) {
            return kernel.start(path, name, this.pid, data); 
        }
        else {
            return PID_NONE; 
        }
    }

    getPidByName(name) {
        return kernel.getPidByName(name); 
    }

    kill() {
        return kernel.kill(this.pid); 
    }

    killByName(name) {
        return kernel.killByName(name); 
    }

    suspend() {
        return kernel.suspend(this.pid); 
    }

    sleep(ticks) {
        return kernel.sleep(this.pid, ticks); 
    }

    defer() {
        return kernel.defer(this.pid); 
    }

    wakeParent(now = true) {
        return kernel.wake(this.ppid, now); 
    }

    killAndWakeParent(now = true) {
        this.kill(); 
        this.wakeParent(now); 
    }

    /**
     * Called when a process is first created. 
     * Use this instead of constructor(). 
     * 
     * @param {Object} args Construction data 
     */
    create(args) {} 

    /**
     * Called when a process is reloaded. 
     * This is also called immediately after create(). 
     */
    reload() {}

    /**
     * Destructor
     */
    destroy() {} 

    /**
     * Called each tick when the process is awake and 
     * there is enough CPU time left. 
     */
    run() {} 

}

module.exports = Process; 