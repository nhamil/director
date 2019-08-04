'use strict' 

const DEBUG = 1; 
const INFO = 2; 
const WARN = 3; 
const ERROR = 4; 

const tag = {
    [DEBUG]: 'DEBUG', 
    [INFO]: 'INFO ', 
    [WARN]: 'WARN ', 
    [ERROR]: 'ERROR' 
}

const colors = {
    [DEBUG]: 'gray', 
    [INFO]: 'white', 
    [WARN]: 'yellow', 
    [ERROR]: 'red' 
}

const backgroundColors = {
    [ERROR]: 'yellow'
}

const whitelist = {}; 
const blacklist = {}; 

let useWhitelist = false; 

class Logger {

    constructor(prefix, level) {
        if (prefix) {
            this.name = '[' + prefix + '] '; 
        }
        else {
            this.name = ''; 
        }
        this.setLevel(level || this.INFO); 
    }

    get DEBUG() { return DEBUG; } 
    get INFO() { return INFO; } 
    get WARN() { return WARN; }
    get ERROR() { return ERROR; } 

    setLevel(level) {
        this.level = level; 
    }

    get useWhitelist() { return useWhitelist; } 

    set useWhitelist(value) { useWhitelist = value; } 

    whitelist(name, add = true) {
        if (name === undefined) {
            name = this.name; 
        }
        if (add) {
            whitelist[name] = true; 
        }
        else {
            whitelist[name] = false; 
        }
    }

    blacklist(name, add = true) {
        if (name === undefined) {
            name = this.name; 
        }
        if (add) {
            blacklist[name] = true; 
        }
        else {
            blacklist[name] = false; 
        }
    }

    createLogger(name) {
        return new Logger(name, this.level); 
    }

    debug(text) {
        this._log(text, DEBUG); 
    }

    info(text) {
        this._log(text, INFO); 
    }

    warn(text) {
        this._log(text, WARN); 
    }

    error(text) {
        this._log(text, ERROR); 
    }

    _log(text, level) {
        if (!this._shouldLog(level)) return; 
        let prefix = ''; 
        let suffix = ''; 
        if (level) {
            prefix = `<span style="color: ${colors[level]}`; 
            suffix = `</span>`; 
            if (backgroundColors[level]) {
                prefix += `; background-color: ${backgroundColors[level]}`;
            }
            prefix += `">[${tag[level]}]`; 
        }
        console.log(prefix + ' ' + this.name + text + suffix); 
    }

    _shouldLog(level) {
        if (level < this.level) return false; 
        if (useWhitelist) {
            return whitelist[this.name] && !blacklist[this.name]; 
        }
        else {
            return !blacklist[this.name]; 
        }
    }

}

module.exports = new Logger(); 
