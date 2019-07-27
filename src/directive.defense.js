const dir = module.exports; 

/**
 * @param {Room} room 
 */
dir.run = function(room) 
{
    let army = 
    {
        army: Director.getCreepsByHomeroomAndRole(room, ['brute', 'ranger', 'healer']), 
        brutes: Director.getCreepsByHomeroomAndRole(room, 'brute'), 
        rangers: Director.getCreepsByHomeroomAndRole(room, 'ranger'), 
        healers: Director.getCreepsByHomeroomAndRole(room, 'healer'), 
        idleArmy: Director.getCreepsByHomeroomAndRoleWithoutTask(room, ['brute', 'ranger', 'healer']), 
        idleBrutes: Director.getCreepsByHomeroomAndRoleWithoutTask(room, 'brute'), 
        idleRangers: Director.getCreepsByHomeroomAndRoleWithoutTask(room, 'ranger'), 
        idleHealers: Director.getCreepsByHomeroomAndRoleWithoutTask(room, 'healer')   
    }

    minimalGuard(room, army); 
}

let minimalGuard = function(room, army) 
{
    let guardBrutes = _.filter(army.brutes, c => Directive.getCreepTaskName(c) === 'guard'); 

    let minGuard = Math.min(room.controller.level, 2); 

    let enemies = room.find(FIND_CREEPS, {
        filter: c => !c.my
    });
    if (enemies.length > 0) 
    {
        let e = enemies[0]; 
        let user = e.owner.username; 
        Director.log('EMERGENCY: Spawn extra defense, under attack from ' + user + ' in room ' + room.name); 

        let date = Util.getDate(); 

        if (user == 'Invader') 
        {
            Memory.lastInvaderTime = date + ' in room ' + room.name; 
        }
        else 
        {
            Memory.lastAttacked = date + ' in room ' + room.name; 
            Memory.lastAttacker = user; 

            if (Game.time % 10 === 0) 
            {
                Game.notify('[' + date + '] Under attack by ' + user + ' in room ' + room.name); 
            }
        }
        
        Memory.attackHistory = Memory.attackHistory || {}; 
        Memory.attackHistory[user] = date + ' in room ' + room.name; 

        Director.requestSpawn(room, 'brute', true, 0); 

        let towers = room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_TOWER 
        }); 

        for (let t of towers) 
        {
            t.attack(enemies[0]); 
        }
    } 

    if (guardBrutes.length >= minGuard) 
    {
        Director.log('Standard defenses engaged for room ' + room.name); 
    }
    else 
    {
        Director.log('Activating standard defenses for room ' + room.name); 

        for (let c of army.idleArmy) 
        {
            Directive.assignTaskToCreep(c, {
                id: 'guard'
            }); 
            minGuard--; 
        }

        if (minGuard > 0)
        {
            Director.requestSpawn(room, 'brute'); 
        }
    }
    
    // TODO this is bad but I'm lazy, fix this later 
    for (let c of army.idleArmy) 
    {
        Directive.assignTaskToCreep(c, {
            id: 'guard'
        }); 
        minGuard--; 
    }

    if (Memory.lastInvaderTime) Director.log('Last invasion at ' + Memory.lastInvaderTime); 
    if (Memory.lastAttacked) Director.log('Last attacked at ' + Memory.lastAttacked + ' by ' + Memory.lastAttacker); 
}