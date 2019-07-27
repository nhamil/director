const role = module.exports; 

role.initial = 'C'; 

role.getBuild = function(energy) 
{
    return [MOVE, CLAIM, MOVE]; 
}