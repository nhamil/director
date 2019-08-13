'use strict' 

function bucketCheck(throwError) {
    if (Game.cpu.bucket < 800) {
        const msg = 'Low bucket, waiting to replenish: ' + Game.cpu.bucket + '/800'; 
        Game.notify(msg); 
        if (throwError) {
            throw new Error(msg); 
        }
        else {
            console.log(msg); 
            return false; 
        }
    }
    return true; 
}

bucketCheck(true); 

require('./constants'); 

const Kernel = require('./os/kernel'); 

global.kernel = new Kernel(); 

Memory.cpu = Memory.cpu || 0; 
Memory.lastReload = Game.time; 

let lastUpdate = 0; 
let out = ''; 

module.exports.loop = function () {
    if (!bucketCheck(false)) return; 
    kernel.__run(); 

    const time = new Date().getTime(); 

    if (time - lastUpdate >= 1000) {
        const pidTable = kernel.pidTable; 
        printScriptStats(pidTable); 
    }
    else {
        printData(out); 
    }
    
    Memory.cpu = Game.cpu.getUsed() * 1.15; 
}

function printScriptStats(pidTable) {
    const length = 50; 
    const memKb = RawMemory.get().length * 1 / 1024; 
    const mem = memKb / 2048; 
    const cpu = Game.cpu.getUsed() * 1.0 / Game.cpu.limit; 
    const bucket = Game.cpu.bucket / 10000; 

    out = ''; 
    out += 'Game Time   : ' + Game.time + '\n'; 
    out += 'Last Reload : ' + (Game.time - Memory.lastReload) + ' tick(s)\n' 
    out += 'Processes   : ' + kernel.processCount + '\n'; 
    out += 'Run Count   : ' + kernel.runCount + '\n'; 
    out += 'Hit Wall    : ' + kernel.hitWall + '\n'; 
    out += 'CPU Limit   : ' + kernel.cpuLimit + '\n'; 
    out += '\n'; 
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
    out += pidTable; 

    // temp 
    out += '\nRemaining Queues\n'; 
    for (let p = PRIORITY_HIGHEST; p <= PRIORITY_LOWEST; p++) {
        out += p.toString().padStart(2, ' ') + ' : [';
        out += kernel.__memory.queues[p]; 
        out += ']\n'; 
    }

    printData(out); 
}

function printData(text) {
    const visual = new RoomVisual()
    const tableLines = text.split(/\n/g); 
    let y = 3.5; 
    for (let line of tableLines) {
        visual.text(line, 1.5, y, {
            align: 'left', 
            font: '0.35 monospace'
        }); 
        y += 0.5; 
    }
}