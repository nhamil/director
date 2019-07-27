Creep.prototype._moveTo = Creep.prototype.moveTo; 
Creep.prototype._move = Creep.prototype.move; 

const addX = 
{
    1: 0, 
    2: 1, 
    3: 1, 
    4: 1, 
    5: 0, 
    6: -1, 
    7: -1, 
    8: -1
};

const addY = 
{
    1: -1, 
    2: -1, 
    3: 0, 
    4: 1, 
    5: 1, 
    6: 1, 
    7: 0, 
    8: -1 
};

const terrains = {}; 

Creep.prototype.moveTo = function(a, b, c) 
{
    let res = this._moveTo(a, b, c); 

    if (res === OK) 
    {
        // Travel.addMovementOnRoomPosition(this.pos); 
    }

    return res; 
}

Creep.prototype.move = function(dir) 
{
    let res = this._move(dir); 

    if (res === OK) 
    {
        let x = this.pos.x + addX[dir]; 
        let y = this.pos.y + addY[dir]; 
        let rName = this.room.name
        terrains[rName] = terrains[rName] || this.room.getTerrain(); 
        if (terrains[rName].get(x, y) !== 1) Travel.addMovementOnPos(this.pos.x, this.pos.y, rName); 
    }

    return res; 
}