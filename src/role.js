'use strict'

const role = module.exports; 

/**
 * @param {string[]} base 
 * @param {string[]} add 
 */
function createBasicBodyRole(initial, base, add = null, addCap = Infinity) {
    return {
        initial: initial, 
        build: function(energy) {
            let body = [...base]; 
    
            if (add) {
                let bodyCost = util.getBodyCost(body); 
                let addCost = util.getBodyCost(add); 
    
                let remainingEnergy = energy - bodyCost; 
                let addAmt = Math.floor(Math.min(
                    addCap, 
                    Math.max(
                        0, 
                        remainingEnergy / addCost
                    ) 
                )); 

                while (body.length + addAmt * add.length > 50) addAmt--; 

                // console.log("building " + initial + " with " + energy + " (" + remainingEnergy + ") energy with " + addCost + " add cost: " + addAmt); 
    
                for (let i = 0; i < addAmt; i++) {
                    body = body.concat(add); 
                }
            }
    
            return body.sort((a, b) => partOrder[a] - partOrder[b]); 
        }
    }
}

const partOrder = {
    [MOVE]: 100, 
    [WORK]: 50,  
    [CARRY]: 50, 
    [TOUGH]: 0, 
    [ATTACK]: 10, 
    [RANGED_ATTACK]: 20, 
    [CLAIM]: 110 
};

const roles = {
    builder: createBasicBodyRole(
        'B', 
        [WORK, CARRY, MOVE], 
        [WORK, CARRY, MOVE], 
        3
    ), 
    repairer: createBasicBodyRole(
        'R', 
        [WORK, CARRY, MOVE], 
        [WORK, CARRY, MOVE], 
        3
    ), 
    general: createBasicBodyRole(
        'G', 
        [WORK, CARRY, MOVE], 
        [WORK, CARRY, MOVE], 
        3
    ), 
    miner: createBasicBodyRole(
        'M', 
        [WORK, WORK, MOVE], 
        [WORK], 
        3
    ), 
    hauler: createBasicBodyRole(
        'H', 
        [CARRY, CARRY, MOVE], 
        [CARRY, CARRY, MOVE], 
        4
    )
}; 

role.get = function(role) {
    return roles[role]; 
} 

role.initial = function(role) {
    let r = roles[role]; 
    if (r) {
        return r.initial; 
    }
    else {
        return null; 
    }
} 

role.build = function(role, energy) {
    let r = roles[role]; 
    if (r) {
        return r.build(energy); 
    }
    else {
        return null; 
    }
} 