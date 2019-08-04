'use strict' 

const stats = require('./stats'); 

Creep.prototype._upgradeController = Creep.prototype.upgradeController; 

Creep.prototype.upgradeController = function(target) {
    let res = this._upgradeController(target); 

    if (res === OK) {
        stats.onUpgradeController(0, 1); 
    }

    return res; 
}