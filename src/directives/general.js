'use strict' 

const log = require('../log'); 
const util = require('../util'); 
const DirectiveBase = require('./directive'); 

class GeneralDirective extends DirectiveBase {

    constructor(room) {
        super(room); 
    }

    preFrame() {
        this.idle = this.getIdleCreepsByTemplate('general'); 

        // this.requestSpawn('general'); 
        
    }

    update() {
        for (let c of this.idle) {
            if (_.sum(c.carry) === 0) {
                util.assignTaskToCreep(c, {
                    id: 'withdraw' 
                });
            }
            else {
                util.assignTaskToCreep(c, {
                    id: 'upgrade', 
                    target: room.name 
                });
            }
        }
    }

}

module.exports = GeneralDirective; 