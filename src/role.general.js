const role = module.exports; 

role.initial = 'G'; 

role.getBuild = function(energy) 
{
    return [WORK, CARRY, MOVE]; 
}