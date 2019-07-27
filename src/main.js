require('./util'); 
require('./travel'); 

require('./directive'); 
require('./director'); 

require('./prototype.creep'); 

Director.init(); 

module.exports.loop = function() 
{
    Director.run(); 
}