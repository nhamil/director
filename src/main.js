'use strict' 

const director = require('./director'); 
const log = require('./log'); 
const util = require('./util'); 

require('./gen-prototypes'); 

log.write('Initializing the Director'); 

module.exports.loop = function() {
    director.update(); 
    util.update(); 

} 
