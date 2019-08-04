'use strict' 

let timePeriod; 
let stats; 

function pre() {
    stats = Memory.stats = Memory.stats || {}; 
    timePeriod = Memory.stats.timePeriod = Math.floor(new Date().getTime() / (1000 * 60)); 

    _.defaults(stats, {
        [timePeriod]: {} 
    });
}

function update() {
    pre(); 
}

function onUpgradeController(room, amount) {
    _.defaults(stats[timePeriod], {
        upgrade: 0 
    });
    
    stats[timePeriod] += amount; 
}

pre(); 

module.exports = {
    update, 
    get timePeriod() {
        return timePeriod; 
    }, 
    onUpgradeController 
}