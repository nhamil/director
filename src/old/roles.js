'use strict' 

const sort = require('./sort'); 

/** 
 * Any body parts without a value (or default value) are provided the value `5`.
 * All values must be in `[0, 9]`.
 * @type {Object<string, Record<BodyPartConstant|string, number>>} 
 */
const sortingMethods = {
    standard: {
        default: 5, 
        [TOUGH]: 1, 
        [MOVE]: 9, 
        [HEAL]: 7,
        [ATTACK]: 7, 
        [RANGED_ATTACK]: 7 
    }, 
    soldier: {
        default: 5, 
        [TOUGH]: 1, 
        [MOVE]: 2, // use as a secondary 'tough'
        [HEAL]: 7,
        [ATTACK]: 7, 
        [RANGED_ATTACK]: 7 
    }
};

// add default values
for (let key in sortingMethods) {
    let sort = sortingMethods[key]; 
    for (let part in BODYPART_COST) {
        if (sort[part] === undefined) {
            if (sort.default === undefined) {
                sort[part] = 5; 
            }
            else {
                sort[part] = sort.default; 
            }
        }
    }
}

class Role {

    /**
     * @param {RoleOptions} opts 
     */
    constructor(name, shortName, opts) {
        _.defaults(opts, {
            base: [WORK, CARRY], 
            add: [], 
            buildStyle: 'standard', 
            movesPerPart: 0.5, 
            maxParts: 50
        });
        Object.assign(this, opts); 
        this.name = name; 
        this.shortName = shortName; 
    }

    static getBodyCost(body) {
        let sum = 0; 
        for (let i = 0; i < body.length; i++) {
            sum += BODYPART_COST[body[i]]; 
        }
        return sum; 
    }

    /**
     * @param {number} maxEnergy 
     */
    createBody(maxEnergy) {
        let parts = _.clone(this.base); 
        let toAdd = _.clone(this.add).reverse(); 

        let moveCount = _.filter(parts, x => x === MOVE).length; 
        let fatigueCount = parts.length - moveCount; 
        // add one because we add a move at the end
        moveCount++; 

        const addMoveParts = (add) => {
            let targetMoveCount = Math.round(fatigueCount * this.movesPerPart); 
            let left = targetMoveCount - moveCount; 
            for (let i = 0; i < left; i++) {
                add.push(MOVE); 
                moveCount++; 
            }
        }

        const getFatiguePartCount = (parts) => {
            return _.filter(parts, x => x !== MOVE).length; 
        }

        addMoveParts(parts); 
        let curCost = BODYPART_COST[MOVE] + Role.getBodyCost(parts); 

        if (this.add.length) {
            let i = 0; 
            while (parts.length + 1 < this.maxParts && curCost < maxEnergy) {
                let add = []; 
                add.push(toAdd[i % toAdd.length]); 
                fatigueCount += getFatiguePartCount(add); 
                addMoveParts(add); 
                
                let newCost = Role.getBodyCost(add); 
                
                if (curCost + newCost <= maxEnergy) {
                    curCost += newCost; 
                    parts = add.concat(parts); 
                    i++; 
                }
                else {
                    break; 
                }
            }
        }

        const method = sortingMethods[this.buildStyle]; 
        sort.countSort(parts, 0, 9, x => method[x]);

        // last move always at end 
        parts.push(MOVE); 

        return parts; 
    }

}

module.exports = {
    general: new Role('general', 'g', {
        base: [WORK, CARRY], 
        movesPerPart: 1 
    }), 
    worker: new Role('worker', 'w', {
        base: [WORK, CARRY], 
        add: [WORK, CARRY], 
        movesPerPart: 0.5
    }), 
    miner: new Role('miner', 'm', {
        base: [WORK, WORK], 
        add: [WORK], 
        movesPerPart: 0, 
        maxParts: 6
    }), 
    supplier: new Role('supplier', 's', {
        base: [CARRY], 
        add: [CARRY], 
        movesPerPart: 0.5, 
        maxParts: 20
    }), 
    archer: new Role('archer', 'a', {
        base: [RANGED_ATTACK], 
        add: [RANGED_ATTACK, ATTACK, HEAL, TOUGH, TOUGH], 
        movesPerPart: 0.5, 
        buildStyle: 'soldier' 
    })
}
