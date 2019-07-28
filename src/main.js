'use strict' 

require('./Director'); 
require('./prototype'); 
require('./util'); 

util.log('Initializing the Director'); 

util.invokeSafe(function() {
    util.init(); 
    Director.init(); 
}); 

module.exports.loop = function() {
    util.invokeSafe(function() {
        Director.run(); 
        util.update(); 
    }); 
} 
