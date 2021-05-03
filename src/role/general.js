'use strict' 

module.exports = {

    initial: 'G', 

    getBuild: function(energy) {
        return [WORK, CARRY, MOVE]; 
    }
    
};