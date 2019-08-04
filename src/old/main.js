'use strict'

require('./constants'); 

const log = require('./log'); 
// const Director = require('./Director'); 

require('./prototypes'); 

// const director = new Director(); 

// Director = new (require('./Director')); 

module.exports.loop = function () {
    // director.update(); 
    // console.log(); 
    // Director.update(); 
    Director.init(); 
}