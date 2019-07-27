const role = module.exports; 

role.initial = 'S'; 

role.getBuild = function(energy) 
{
    let parts = [MOVE, CARRY, WORK]; 

    energy = Math.min(300 + 50*10, energy); 

    let add = [CARRY, CARRY]; 
    let i = 0; 
    while (Util.getBodyCost(parts) <= energy) 
    {
        parts.push(add[i]); 
        i = (i + 1) % add.length; 
        if (i == 0) 
        {
            // dead parts still affect move, so put moves at front 
            parts.unshift(MOVE); 
        }
    }

    while (parts.length > 3 && Util.getBodyCost(parts) > energy) parts.pop(); 

    return parts.reverse(); 
}