'use strict' 

const dir = module.exports; 

dir.preFrame = function(room) {
    Director.requestSpawn({
        home: room.name, 
        template: 'general' 
    });
}

dir.run = function(room) {
    let list = Director.getIdleCreepsByHome(room, 'general'); 

    for (let c of list) {
        if (_.sum(c.carry) === 0) {
            util.assignTaskToCreep(c, {
                id: 'withdraw' 
            });
        }
        else {
            util.assignTaskToCreep(c, {
                id: 'upgrade', 
                target: room.name 
            });
        }
    }
}