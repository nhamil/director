'use strict' 

const sort = require('./sort'); 
const util = require('./util'); 

/**
 * Holds settings for creating a creep 
 * 
 * @typedef {object} BodyTemplate
 * 
 * @property {string} [name] 
 * @property {string} [shortName] 
 * @property {string[]} base 
 * @property {string[]} [add = []]
 * @property {string} [buildStyle = 'standard'] 
 * @property {number} [movesPerPart = 0.5] 
 * @property {number} [maxParts = 50] 
 */

/** @type {Object<string, BodyTemplate>} */
const types = {
    general: {
        base: [WORK, CARRY], 
        movesPerPart: 1 
    }, 
    worker: {
        base: [WORK, CARRY], 
        add: [WORK, CARRY], 
        movesPerPart: 0.5
    }, 
    miner: {
        base: [WORK, WORK], 
        add: [WORK], 
        movesPerPart: 0, 
        maxParts: 6
    }, 
    supplier: {
        base: [CARRY], 
        add: [CARRY], 
        movesPerPart: 0.5, 
        maxParts: 20 
    }, 
    archer: {
        base: [RANGED_ATTACK], 
        add: [RANGED_ATTACK, ATTACK, HEAL, TOUGH, TOUGH], 
        movesPerPart: 0.5, 
        buildStyle: 'soldier' 
    }
};

/** 
 * Any body parts without a value (or default value) are provided the value `5`.
 * All values must be in [0, 9].
 * @type {Record<string, Record<string, number>>} 
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

// give template bodies default names 
for (let key in types) {
    /** @type {BodyTemplate} */
    let t = types[key]; 

    if (t.name === undefined) {
        t.name = key; 
    }
    if (t.shortName === undefined) {
        t.shortName = t.name.substring(0, Math.min(2, t.name.length)); 
    }
}

/**
 * @param {number} maxEnergy 
 * @param {BodyTemplate|string} type
 */
function createBody(maxEnergy, type) {
    if (typeof type === 'string') {
        type = types[type]; 
    }

    if (!type) return null; 

    _.defaults(type, {
        add: [], 
        buildStyle: 'standard', 
        movesPerPart: 0.5, 
        maxParts: 50 
    }); 

    let parts = _.clone(type.base); 
    let toAdd = _.clone(type.add).reverse(); 

    let moveCount = _.filter(parts, x => x === MOVE).length; 
    let fatigueCount = parts.length - moveCount; 
    // add one because we add a move at the end
    moveCount++; 

    const addMoveParts = function(add) {
        let targetMoveCount = Math.round(fatigueCount * type.movesPerPart); 
        let left = targetMoveCount - moveCount; 
        for (let i = 0; i < left; i++) {
            add.push(MOVE); 
            moveCount++; 
        }
    }

    const getFatiguePartCount = function(parts) {
        return _.filter(parts, x => x !== MOVE).length; 
    }

    addMoveParts(parts); 
    let curCost = BODYPART_COST[MOVE] + util.getBodyCost(parts); 

    if (type.add.length) {
        let i = 0; 
        while (parts.length + 1 < type.maxParts && curCost < maxEnergy) {
            let add = []; 
            add.push(toAdd[i % toAdd.length]); 
            fatigueCount += getFatiguePartCount(add); 
            addMoveParts(add); 
            
            let newCost = util.getBodyCost(add); 
            
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

    const method = sortingMethods[type.buildStyle]; 
    sort.countSort(parts, x => method[x], 0, 9);

    // last move always at end 
    parts.push(MOVE); 

    return parts; 
}

module.exports = {
    bodies: types, 
    createBody 
}