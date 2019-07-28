'use strict' 

module.exports = {
    build: null, 
    claim: null, 
    guard: null, 
    mine: null, 
    repair: null, 
    supply: null, 
    upgrade: require('./tasks/upgrade'), 
    withdraw: require('./tasks/withdraw')  
};
