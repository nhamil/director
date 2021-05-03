'use strict' 

require('./constants'); 
require('./util'); 
require('./os/process'); 

const Kernel = require('./os/kernel'); 

/**
 * Used to determine when to stop scripts from running when the bucket is too low. 
 * This allows processes to go over the CPU limit without ending abruptly. 
 */
function bucketCheck() {
    if (Game.cpu.bucket < 800) {
        const msg = 'Low bucket, waiting to replenish: ' + Game.cpu.bucket + '/800'; 
        Game.notify(msg); 
        console.log(msg); 
        return false; 
    }
    return true; 
}

Kernel.reset(); 

module.exports.loop = function() {
    if (!bucketCheck()) return; 

    kernel.run(); 
}