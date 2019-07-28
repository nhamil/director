'use strict'

const log = require('./log'); 

const statusShorthands = {
    harvest: '🌾',
    mine: '⛏️',
    upgrade: '💪',
    build: '🏗️',
    supply: '🚚',
    withdraw: '🌾',
    repair: '🛠️'
};

function computeTickRate() {
    requireField(Memory, 'ticks', []);
    let time = Math.floor(new Date().getTime() / 1000);
    let ticks = Memory.ticks;
    let total = 0;
    let duration = 10; // seconds
    for (let i = 0; i < ticks.length;) {
        if (time - Memory.ticks[i] > duration) {
            ticks.splice(i, 1);
        }
        else {
            total++;
            i++;
        }
    }
    return total / duration;
}

let cacheTime = 0;
let updateLog = false;
let tickRate = 0; 

function init() {
    requireField(Memory, 'lastLog', Game.time);
    requireField(Memory, 'ticks', []);
    tickRate = computeTickRate();
}

function update() {
    cacheTime++;

    let time = Math.floor(new Date().getTime() / 1000);
    /** @type {Array<number>} */
    let ticks = Memory.ticks;
    ticks.push(time);

    let rate = tickRate = computeTickRate();;
    new RoomVisual().text('TPS: ' + rate, 24.5, 1.5, {
        align: 'center'
    });

    if (Game.time - Memory.lastLog > tickRate) {
        updateLog = true;
    }

    if (updateLog) {
        Memory.lastLog = Game.time;
        updateLog = false;
        log.write('Tick Rate: ' + tickRate);
    }
}

/**
 * @param {Room} room 
 */
function isMyRoom(room) {
    return room && room.controller && room.controller.my; 
}

/**
 * @param {string[]} build 
 */
function getBodyCost(build) {
    let sum = 0;
    for (let i = 0; i < build.length; i++) {
        sum += BODYPART_COST[build[i]];
    }
    return sum;
}

/**
 * @param {string} baseName
 */
function randomName(baseName) {
    return '' + baseName + Math.floor(Math.random() * 1000);
}

/**
 * @param {string} template
 * @returns {(c: Creep) => boolean}
 */
function isCreepOfTemplate(template) {
    return c => c.memory.template === template;
}

/**
 * @param {Creep[]} creeps 
 * @param {RoomObject} target 
 */
function getIndexOfClosestCreep(creeps, target) {
    let best = Infinity;
    let index = -1;

    for (let i = 0; i < creeps.length; i++) {
        let dist = creeps[i].pos.getRangeTo(target);
        if (dist < best) {
            index = i;
            best = dist;
        }
    }

    return index;
}

/**
 * @param {number} interval 
 * @param {function} fn 
 * @returns Whether `fn` was called 
 */
function onInterval(interval, fn) {
    if (Game.time % interval === 0) {
        fn();
        return true;
    }
    return false;
}

/**
 * @param {number} interval 
 * @param {function} fn 
 * @returns Whether `fn` was called 
 */
function onCacheInterval(interval, fn) {
    if (cacheTime % interval === 0) {
        fn();
        return true;
    }
    return false;
}

function getDateCst(date = new Date()) {
    return new Date(date.getTime() - 5 * 3600 * 1000).toUTCString().replace('GMT', 'CST');
}

/**
 * @param {RoomPosition} a 
 * @param {RoomPosition} b
 */
function arePositionsEqual(a, b) {
    return a.x == b.x && a.y == b.y && a.roomName == b.roomName;
}

/**
 * @param {string} memData 
 */
function stringToPosition(memData) {
    try {
        let out = memData.split(',');
        return new RoomPosition(parseInt(out[0]), parseInt(out[1]), out[2]);
    }
    catch (e) { return null; }
}

/**
 * @param {RoomPosition} pos 
 */
function positionToString(pos) {
    return pos.x + ',' + pos.y + ',' + pos.roomName;
}

/**
 * @param {function} run 
 * @param {function(Error)} [err] 
 */
function invokeSafe(run, err) {
    try {
        run();
    }
    catch (e) {
        let msg = e.stack.replace(/ \(eval .*\),\s*/g, '');
        if (err) {
            err(msg);
        }
        else {
            console.log(msg);
            Game.notify(msg);
        }
    }
}

/**
 * @param {any} obj 
 * @param {string} path 
 * @param {any} [def]
 */
function getField(obj, path, def = null) {
    if (obj == null) return def;

    let fields = path.split('.');
    let last = fields[fields.length - 1];

    for (let i = 0; i < fields.length - 1; i++) {
        let next = obj[fields[i]];

        if (next === undefined) {
            return def;
        }
        else {
            obj = next;
        }
    }

    return obj[last] === undefined ? def : obj[last];
}

/**
 * @param {any} obj 
 * @param {string} path 
 * @param {any} [def]
 */
function requireField(obj, path, def = {}) {
    if (obj == null) throw 'Base object must exist';

    let fields = path.split('.');
    let last = fields[fields.length - 1];

    for (let i = 0; i < fields.length - 1; i++) {
        let next = obj[fields[i]];

        if (next === undefined) {
            obj = obj[fields[i]] = {};
        }
        else {
            obj = next;
        }
    }

    _.defaults(obj, {
        [last]: def
    });

    return obj[last];
}

/**
 * @param {Creep} c 
 */
function finishCreepTask(c) {
    delete c.memory.task;
}

/**
 * @param {Creep} creep 
 */
function assignTaskToCreep(creep, taskInfo) {
    creep.memory.task = taskInfo;
    let status = statusShorthands[taskInfo.id] || taskInfo.id;

    creep.say(status);
}

/**
 * @param {Creep} creep 
 */
function getCreepTaskName(creep) {
    let info = creep.memory.task || {};
    return info.id;
}

/**
 * @param {Creep} creep 
 */
function getCreepTask(creep) {
    return creep.memory.task;
}

/**
 * @param {Creep} creep 
 */
function doesCreepHaveTask(creep) {
    return Directive.getCreepTaskName(creep) != null;
}

function doOrMoveTo(creep, target, action, opts = {}) {
    opts.ok = opts.ok || [OK];

    let status = 0;
    if (opts.arg === undefined) {
        status = creep[action](target);
    }
    else {
        status = creep[action](target, opts.arg);
    }

    if (opts.ok.indexOf(status) === -1) {
        creep.moveTo(target);
    }
}

init(); 

module.exports = {
    arePositionsEqual,
    assignTaskToCreep,
    doesCreepHaveTask,
    doOrMoveTo,
    finishCreepTask,
    getBodyCost,
    getCreepTask,
    getCreepTaskName,
    getDateCst,
    getField,
    getIndexOfClosestCreep,
    randomName,
    invokeSafe,
    isCreepOfTemplate,
    isMyRoom, 
    onCacheInterval,
    onInterval,
    positionToString,
    requireField,
    stringToPosition,
    update
};
