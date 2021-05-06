'use strict' 

module.exports = {

    initial: 'B', 

    getBuild: function(energy) {
        let body = []; 

        let segmentCost = BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE]; 
        let segments = Math.max(1, Math.ceil(energy / segmentCost)); 

        for (let i = 0; i < segments; i++) {
            body.push(CARRY); 
            body.push(WORK); 
        }

        body = body.reverse(); 

        for (let i = 0; i < segments; i++) {
            body.push(MOVE); 
        }

        return body; 
    }
    
};