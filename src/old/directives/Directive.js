'use strict' 

const priority = require('../priority'); 

class Directive {

    constructor(name) {
        this._name = name; 
    }

    preUpdate() {}

    update() {} 

    postUpdate() {} 

    get priority() { return priority.MEDIUM; } 

    get name() { return this._name; } 

    toString() {
        return this.name; 
    }

}

module.exports = Directive; 