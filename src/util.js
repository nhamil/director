'use strict' 

if (!Creep.prototype._say) Creep.prototype._say = Creep.prototype.say; 

Creep.prototype.say = function(msg, toPublic) {
    // return this._say(this.name[0] + ":" + msg, toPublic); 
}

let sim = _.keys(Game.rooms).some(i => i === 'sim'); 
if (sim) {
    console.log("Running in simulation mode"); 
}

const simulation = !!sim; 
let _time, _cpuTime, getTime, cpuLimit, bucket; 

if (simulation) {
    _time = Game.time; 
    _cpuTime = 0; 
    getTime = function() {
        if (_time !== Game.time) _cpuTime = 0; 

        _cpuTime += 1.0; 
        return _cpuTime; 
    } 
    cpuLimit = 500; 
    bucket = 10000; 
}
else {
    getTime = () => Game.cpu.getUsed(); 
    cpuLimit = Game.cpu.limit; 
    bucket = Game.cpu.bucket; 
}

/**
 * @param {Room} room 
 * @returns {Source[]}
 */
function findSafeSources(room) {
    return room.find(FIND_SOURCES, {
        filter: s => s.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length === 0 // filter out source keepers 
    }); 
}

function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2); 
}

function randomColor() {
    return '#'+Math.floor(Math.random()*0x1000000).toString(16);
}

/** 
 * @param {string} str 
 * @returns {string}
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1); 
}

/**
 * @param {Array} build
 */
function getBodyCost(build) {
    let sum = 0; 

    for (let i = 0; i < build.length; i++) {
        sum += BODYPART_COST[build[i]]; 
    }

    return sum; 
}

function randomName(base) {
    return base + (Math.floor(Math.random() * 100000) + '').padStart(5, '0'); 
}

/**
 * @param {RoomObject} target 
 * @param {RoomObject[]} objects 
 * @returns {number}
 */
function findIndexOfClosestObject(target, objects) {
    let best = Infinity; 
    let index = -1; 

    for (let i = 0; i < objects.length; i++) {
        let dist = objects[i].pos.getRangeTo(target); 
        if (dist < best) {
            index = i; 
            best = dist; 
        }
    }

    return index; 
}

/**
 * @param {string} memData 
 * @param {string?} roomName 
 */
function getRoomPositionReadData(memData, roomName) {
    if (typeof(memData) !== 'string') return; 
    let out = memData.split(','); 
    try {
        return new RoomPosition(parseInt(out[0]), parseInt(out[1]), roomName || out[2]); 
    }
    catch (e) { return; }
}

/**
 * @param {RoomPosition} pos 
 */
function getRoomPositionWriteData(pos) {
    return pos.x + ',' + pos.y + ',' + pos.roomName;
}

/**
 * @param {RoomPosition} a 
 * @param {RoomPosition} b
 */
function arePositionsEqual(a, b) {
    return a.x == b.x && a.y == b.y && a.roomName == b.roomName; 
}

/**
 * @param {RoomPosition} pos 
 */
function createModifiablePos(pos) {
    return { x: pos.x, y: pos.y, roomName: pos.roomName }; 
}

function getDate() {
    let offset = -4;
    let date = new Date(new Date().getTime() + offset * 3600 * 1000); 
    return date.toUTCString().replace('GMT', 'EST'); 
}

module.exports = {
    simulation, 
    getTime, 
    cpuLimit, 
    bucket, 
    findSafeSources, 
    manhattanDistance, 
    randomColor, 
    capitalize, 
    getBodyCost, 
    randomName, 
    findIndexOfClosestObject, 
    getRoomPositionReadData, 
    getRoomPositionWriteData, 
    arePositionsEqual, 
    createModifiablePos, 
    getDate
};

// for console 
global.Util = module.exports; 