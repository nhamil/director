'use strict' 

const util = require('./util'); 

/**
 * Used to determine when to stop scripts from running when the bucket is too low. 
 * This allows processes to go over the CPU limit without ending abruptly. 
 */
function bucketCheck(throwError) {
    if (util.bucket < 800) {
        const msg = 'Low bucket, waiting to replenish: ' + util.bucket + '/800'; 
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

if (!util.simulation) {
    console.log("Restarting..."); 
    let welcome = String.raw` _____ _____ _____  ______ _____ _______ ____  _____  
|  __ \_   _|  __ \|  ____/ ____|__   __/ __ \|  __ \ (R)
| |  | || | | |__) | |__ | |       | | | |  | | |__) |
| |  | || | |  _  /|  __|| |       | | | |  | |  _  / 
| |__| || |_| | \ \| |___| |____   | | | |__| | | \ \ 
|_____/_____|_|  \_\______\_____|  |_|  \____/|_|  \_\ ` + '\n\n';
    console.log(welcome); 
}

const director = require('./director'); 

// directives (added in order)
director.registerDirective('mine'); 
director.registerDirective('haul'); 
director.registerDirective('structure'); 
director.registerDirective('upgrade'); 
director.registerDirective('spawn'); 

// tasks 
director.registerTask('build'); 
director.registerTask('haul'); 
director.registerTask('mine'); 
director.registerTask('repair'); 
director.registerTask('upgrade'); 
director.registerTask('withdraw'); 

console.log("Director is online."); 

module.exports.loop = function() {
    if (!bucketCheck(false)) return; 

    director.run(); 
}