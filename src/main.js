'use strict' 

/**
 * Used to determine when to stop scripts from running when the bucket is too low. 
 * This allows processes to go over the CPU limit without ending abruptly. 
 */
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

// load global modules 
require('./constants'); 
require('./util'); 
require('./os/kernel'); 

module.exports.loop = function() {
    if (!bucketCheck(false)) return; 

    kernel.run();
}