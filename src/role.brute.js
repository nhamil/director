const role = module.exports; 

role.initial = 'Br'; 

let rank = 
{
    [TOUGH]: 1, 
    [ATTACK]: 2, 
    [RANGED_ATTACK]: 3, 
    [MOVE]: 4  
};

// TODO this is ranged 
role.getBuild = function(energy) 
{
    let parts = [MOVE, ATTACK, RANGED_ATTACK]; 

    energy = Math.min(300 + 50*10, energy); 

    let add = [RANGED_ATTACK, TOUGH, TOUGH, TOUGH]; 
    let i = 0; 
    while (Util.getBodyCost(parts) <= energy) 
    {
        parts.push(add[i]); 
        i = (i + 1) % add.length; 
        if (i % 2 === 0) parts.push(MOVE); 
    }

    while (parts.length > 3 && Util.getBodyCost(parts) > energy) parts.pop(); 

    parts.sort((a, b) => rank[a] - rank[b]); 
    return parts; 
}