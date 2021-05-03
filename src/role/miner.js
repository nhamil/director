'use strict' 

module.exports = {

    initial: 'M', 

    getBuild: function(energy) {
        let body = [MOVE, WORK, WORK]; 

        let i = 2; 
        while (i++ < 5 && util.getBodyCost(body)+BODYPART_COST[WORK] <= energy) {
            body.push(WORK); 
        }

        return body.reverse(); 
    }
    
};