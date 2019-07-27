global.Director = module.exports; 

let spawnRequests = []; 

let waitTicks = 30; 
let lastLog = Game.time; 
let text = []; 

Director.tasks = 
{
    build: require('./task.build'), 
    claim: require('./task.claim'), 
    guard: require('./task.guard'), 
    mine: require('./task.mine'), 
    repair: require('./task.repair'), 
    supply: require('./task.supply'), 
    upgrade: require('./task.upgrade'), 
    withdraw: require('./task.withdraw') 
};

Director.directives = 
{
    build: require('./directive.build'), 
    defense: require('./directive.defense'), 
    expand: require('./directive.expand'), 
    general: require('./directive.general'), 
    mine: require('./directive.mine'), 
    repair: require('./directive.repair'),  
    spawn: require('./directive.spawn'), 
    supply: require('./directive.supply'), 
    upgrade: require('./directive.upgrade') 
}; 

Director.roles = 
{
    brute: require('./role.brute'), 
    builder: require('./role.builder'), 
    claimer: require('./role.claimer'), 
    general: require('./role.general'), 
    miner: require('./role.miner'), 
    repairer: require('./role.repairer'), 
    supplier: require('./role.supplier'), 
    upgrader: require('./role.upgrader')  
};

Director.visual = new RoomVisual(); 

Director.setDisplayTravel = function(show) 
{
    Memory.displayTravel = show || false; 

    if (show) 
    {
        return "Displaying travel data"; 
    }
    else 
    {
        return "Hiding travel data"; 
    }
}

Director.log = function(msg, toConsole) 
{
    let t = msg || ""; 
    if (typeof(t) !== 'string') t = JSON.stringify(t); 
    text.push(t);
    if (toConsole) console.log(t);  
}

Director.getSpawnRequestForRoom = function(room) 
{
    for (let i in spawnRequests) 
    {
        let req = spawnRequests[i]; 

        if (req.room === room.name) 
        {
            spawnRequests.splice(parseInt(i), 1); 
            return req; 
        }
    }

    return null; 
} 

Director.isSpawnRequestedForRoom = function(room) 
{
    for (let i in spawnRequests) 
    {
        let req = spawnRequests[i]; 

        if (req.room == room.name) return true; 
    }

    return false; 
}

Director.requestSpawn = function(room, role, needNow, priority) 
{
    spawnRequests.push({
        room: room.name, 
        role: role, 
        now: needNow, 
        priority: priority === undefined ? 1000 : priority 
    }); 

    // lower number come first 
    spawnRequests.sort((a, b) => a.priority - b.priority);
}

Director.init = function() 
{
    console.log('Initializing the Director...'); 
}

let printStats = function() 
{
    let toConsole = Game.time - lastLog >= waitTicks;  
    {
        lastLog = Game.time; 

        let pop = {}; 
        for (let i in Game.creeps) 
        {
            let c = Game.creeps[i]; 
            let role = c.memory.role || 'unknown'; 
            pop[role] = (pop[role] || 0) + 1; 
        }

        let names = _.keys(pop); 
        names.sort(); 

        let msg = undefined; 
        for (let index in names) 
        {
            let i = names[index]; 
            let r = Director.roles[i] || {}; 
            let name = r.initial || i; 
            if (msg) 
            {
                msg += ' ' + name + ':' + pop[i];
            }
            else 
            {
                msg = name + ':' + pop[i]; 
            }
        }
        msg = 'Population (' + _.sum(pop) + '): ' + msg; 
        // console.log(msg); 
        Director.log(msg, toConsole); 
    }
}

let printMessages = function() 
{
    for (let i in text) 
    {
        let t = text[i]; 
        Director.visual.text(t, 1, 1 + parseInt(i), { 
            align: 'left', 
            font: '0.8 monospace' 
        }); 
    }
}

Director.run = function() 
{
    spawnRequests = []; 
    text = []; 

    Travel.preFrame(); 

    Director.log('Current time: ' + Util.getDate()); 
    if (Director.displayTravel) Director.log('Displaying Travel Data'); 

    printStats(); 

    for (let roomName in Game.rooms) 
    {
        try 
        {
            let room = Game.rooms[roomName]; 
            if (isMyRoom(room)) handleMyRoom(room); 
        }
        catch (e) { Director.log(e); console.log(e.stack); Game.notify(e.stack); } 
    }

    for (let creepName in Game.creeps) 
    {
        try 
        {
            let c = Game.creeps[creepName]; 
            if (!c.memory || !c.memory.role) 
            {
                console.log(c.name + ' does not have a role: suiciding'); 
                c.suicide(); 
            }
            else if (c.body.length <= 1) 
            {
                console.log(c.name + ' is too weak: suiciding'); 
                c.suicide(); 
            }
            else if (Directive.doesCreepHaveTask(c)) 
            {
                let taskName = Directive.getCreepTaskName(c); 
                let task = Director.tasks[taskName]; 
                if (task) 
                {
                    let finished = task.run(c, c.memory.task); 
                    if (finished) 
                    {
                        Directive.finishCreepTask(c); 
                    }
                }
                else 
                {
                    console.log(c.name + ' has invalid task: ' + taskName); 
                    Directive.finishCreepTask(c); 
                }
            }
            else if (!c.spawning) 
            {
                Director.log(c.name + ' is idle'); 
            }
        }
        catch (e) { Director.log(e); console.log(e.stack); Game.notify(e.stack); } 
    }

    gc(); 
    printMessages(); 

    Travel.postFrame(); 
    if (Memory.displayTravel) 
    {
        for (let name in Game.rooms) 
        {
            Travel.drawVisuals(Game.rooms[name]); 
        }
    }
}

Director.getCreepsByHomeroom = function(room) 
{
    return _.filter(Game.creeps, c => c.memory.home === room.name); 
}

Director.getCreepsByHomeroomAndRole = function(room, role) 
{
    let roles = {}; 
    if (typeof(role) === 'string') 
    {
        roles[role] = true; 
    }
    else 
    {
        for (let i in role) roles[role[i]] = true; 
    }

    return _.filter(Game.creeps, c => c.memory.home === room.name && roles[c.memory.role]); 
}

Director.getCreepsByHomeroomAndRoleWithoutTask = function(room, role) 
{
    let roles = {}; 
    if (typeof(role) === 'string') 
    {
        roles[role] = true; 
    }
    else 
    {
        for (let i in role) roles[role[i]] = true; 
    }

    return _.filter(Game.creeps, c => c.memory.home === room.name && roles[c.memory.role] && !c.memory.task); 
}

let gc = function() 
{
    gcByName('creeps'); 
    gcByName('powerCreeps'); 
    gcByName('spawns'); 
    gcByName('flags'); 
    for (let name in Memory.rooms) {
        if (_.values(Memory.rooms[name]).length === 0) delete Memory.rooms[name]; 
    }
}

let gcByName = function(entities) 
{
    for (let name in Memory[entities]) 
    {
        if (!Game[entities][name]) 
        {
            delete Memory[entities][name]; 
        }
    }
}

let isMyRoom = function(room) 
{
    return room && room.controller && room.controller.my; 
}

let handleMyRoom = function(room) 
{
    if (_.filter(Game.spawns, s => s.room === room).length === 0) 
    {
        Memory.needsSpawn[room.name] = true; 
    }
    else 
    {
        delete Memory.needsSpawn[room.name]; 
    }

    let directives = getDirectives(room.controller.level); 

    for (let i = 0; i < directives.length; i++) 
    {
        let dir = Director.directives[directives[i]]; 

        if (dir) 
        {
            dir.run(room); 
        }
        else 
        {
            console.log('Unknown directive "' + directives[i] + '"'); 
        }
    }
}

let directivesByRcl = 
{
    1: ['general', 'spawn'],  
    2: ['defense', 'mine', 'repair', 'supply', 'expand', 'build', 'upgrade', 'spawn']
}; 

let getDirectives = function(rcl) 
{
    for (let i = rcl; i >= 1; i--) 
    {
        if (directivesByRcl[i]) return directivesByRcl[i]; 
    }

    // shouldn't happen 
    console.log('ERROR: No directives for RCL ' + rcl); 
    return []; 
}