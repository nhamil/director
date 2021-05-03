'use strict' 

const roles = {
    builder: require('./role/builder'), 
    general: require('./role/general'), 
    miner: require('./role/miner') 
}

module.exports = {
    getRole: function(role) {
        return roles[role]; 
    }, 

    initial: function(role) {
        let r = roles[role]; 
        if (r) {
            return r.initial; 
        }
        else {
            return null; 
        }
    }, 

    build: function(role, energy) {
        let r = roles[role]; 
        if (r) {
            return r.getBuild(energy); 
        }
        else {
            return null; 
        }
    }
}; 