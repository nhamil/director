'use strict' 

Memory.ticks = Memory.ticks || {}; 
Memory.gcl = Memory.gcl || {}; 

const MAX_SECONDS = 20; 

let tickRate = 0.01; 

function update() {
    let time = Math.floor(new Date().getTime() / 1000); 

    Memory.ticks[time] = Memory.ticks[time] || 0; 
    Memory.ticks[time]++; 

    let gclProgress = Game.gcl.progress;
    Memory.gcl[time] = gclProgress; 

    let lowestGcl = Memory.gcl[time]; 

    let ticks = 0; 
    let maxRange = 1; 
    for (let t in Memory.ticks) {
        let second = parseInt(t); 

        let range = time - second; 
        if (range > MAX_SECONDS) {
            delete Memory.ticks[t]; 
            delete Memory.gcl[t]; 
        }
        else {
            if (range > maxRange) {
                maxRange = range; 
                lowestGcl = Memory.gcl[t] || lowestGcl; 
            }
            ticks += Memory.ticks[t]; 
        }
    }
    let avgGclRate = (gclProgress - lowestGcl) / maxRange; 
    let gclEst = estimateTimeLeft(Game.gcl.progressTotal - Game.gcl.progress, avgGclRate); 
    tickRate = Math.floor(100 * ticks / maxRange) / 100; 

    new RoomVisual()
        .text('Tickrate: ' + tickRate, 25.5, 1.5, {align: "center"})
        .text('Next GCL: ' + gclEst, 25.5, 2.5, {align: "center"}); 
}

function secondsToTime(seconds) {
    let days = Math.floor(seconds / 86400); 
    seconds -= days * 86400; 
    let hours = Math.floor(seconds / 3600); 
    seconds -= hours * 3600; 
    let minutes = Math.floor(seconds / 60); 
    seconds -= minutes * 60; 
    return days + ':' + formatTimePart(hours) + ':' + formatTimePart(minutes) + ':' + formatTimePart(seconds); 
}

function formatTimePart(num) {
    return num < 10 ? '0' + num : num;
}

function estimateTimeLeft(remaining, rate) {
    return secondsToTime(rate ? Math.floor(remaining / rate / tickRate) : 86399999); 
}

module.exports = {
    update, 
    tickRate, 
    estimateTimeLeft   
}