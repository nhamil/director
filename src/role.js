'use strict'

const role = module.exports; 

/**
 * @param {string[]} base 
 * @param {string[]} add 
 */
function createBasicBodyRole(initial, base, add = null, addCap = Infinity) {
    return {
        initial: initial, 
        getBuild: function(energy) {
            let body = [...base]; 
    
            if (add) {
                let bodyCost = util.getBodyCost(body); 
                let addCost = util.getBodyCost(add); 
    
                let remainingEnergy = energy - bodyCost; 
                let addAmt = Math.min(
                    addCap, 
                    Math.ceil(
                        0, 
                        remainingEnergy / addCost
                    ) 
                ); 
    
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
        [WORK, CARRY, MOVE]
    ), 
    general: createBasicBodyRole(
        'G', 
        [WORK, CARRY, MOVE]
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
        [CARRY, CARRY, MOVE]
    )
}; 

role.getRole = function(role) {
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
        return r.getBuild(energy); 
    }
    else {
        return null; 
    }
} 