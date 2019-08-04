'use strict' 

const log = require('../log').createLogger('GCDirective'); 
const priority = require('../priority'); 

const Directive = require('./Directive'); 

class GCDirective extends Directive {

    constructor() {
        super('gc'); 
    }

    get priority() {
        return priority.TRIVIAL; 
    }

    postUpdate() {
        if (Game.time % 1000 === 0) {
            log.info('Cleaning up memory'); 
            for (let name in Memory.creeps) {
                if (!Game.creeps[name]) {
                    delete Memory.creeps[name]; 
                }
            }
        }
    }

}

module.exports = GCDirective; 
