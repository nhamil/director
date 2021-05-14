'use strict'

class Process {

    constructor(name) {
        this.name = name; 
    }

    log(x = "") {
        let lines = String(x).split("\n"); 
        let out = ""; 
        for (let line of lines) {
            out += '[' + this.name + '] ' + line + '\n'; 
        }
        console.log(out); 
    }

    reload() {} 

    run() {} 

}

module.exports = Process; 