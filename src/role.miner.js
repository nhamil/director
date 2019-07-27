const role = module.exports; 

role.initial = 'M'; 

role.getBuild = function(energy) 
{
    let parts = [MOVE, WORK, WORK];

    let i = 0; 
    while (Util.getBodyCost(parts) <= energy && i++ < 4)  
    {
        parts.push(WORK); 
    }

    parts.pop(); 
    return parts.reverse(); 
}