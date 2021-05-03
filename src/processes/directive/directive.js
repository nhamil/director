'use strict' 

const Process = require('../../os/process'); 

class DirectiveProcess extends Process {

    get priority() {
        return PRIORITY_LOW; 
    }

    get room() {
        return Game.rooms[this.data.room]; 
    }

    create(args) {
        for (let i in args) {
            this.data[i] = args[i]; 
        }
    }

}

module.exports = DirectiveProcess; 