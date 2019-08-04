'use strict' 

function bucketCheck() {
    if (Game.cpu.bucket < 500) {
        const msg = 'Low bucket, waiting to replenish: ' + Game.cpu.bucket; 
        Game.notify(msg); 
        throw new Error(msg); 
    }
}

bucketCheck(); 

require('./constants'); 

const Kernel = require('./os/kernel'); 

global.kernel = new Kernel(); 

Memory.cpu = Memory.cpu || 0; 
Memory.lastReload = Game.time; 

module.exports.loop = function () {
    bucketCheck(); 
    kernel.__run(); 

    const pidTable = kernel.pidTable; 
    printScriptStats(pidTable); 

    // Memory.cpu = Game.cpu.getUsed() * 1.15; 
}

function printScriptStats(pidTable) {
    const length = 50; 
    const memKb = RawMemory.get().length * 1 / 1024; 
    const mem = memKb / 2048; 
    const cpu = Game.cpu.getUsed() * 1.0 / Game.cpu.limit; 
    const bucket = Game.cpu.bucket / 10000; 

    let out = ''; 
    out += 'Last Reload: ' + (Game.time - Memory.lastReload) + ' tick(s)\n\n'; 
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