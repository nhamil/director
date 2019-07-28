'use strict'

global.util = module.exports;

const statusShorthands = {
    harvest: '🌾',
    mine: '⛏️',
    upgrade: '💪',
    build: '🏗️',
    supply: '🚚',
    withdraw: '🌾',
    repair: '🛠️'
};

const computeTickRate = function() {
    util.requireField(Memory, 'ticks', []); 
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

util.cacheTime = 0;
util.updateLog = false; 

util.init = function() {
    util.requireField(Memory, 'lastLog', Game.time); 
    util.requireField(Memory, 'ticks', []); 
    util.tickRate = computeTickRate(); 
}

util.update = function () {
    util.cacheTime++;

    let time = Math.floor(new Date().getTime() / 1000); 
    /** @type {Array<number>} */
    let ticks = Memory.ticks; 
    ticks.push(time); 

    let rate = util.tickRate = computeTickRate();; 
    new RoomVisual().text('TPS: ' + rate, 24.5, 1.5, {
        align: 'center' 
    }); 

    if (Game.time - Memory.lastLog > util.tickRate) {
        util.updateLog = true; 
    }

    if (util.updateLog) {
        Memory.lastLog = Game.time; 
        util.updateLog = false; 
        console.log('Tick Rate: ' + util.tickRate); 
    }
}

/**
 * @param {any} msg 
 */
util.log = function (msg) {
    if (typeof msg !== 'string') msg = JSON.stringify(msg);

    console.log(msg);
}

/**
 * @param {Room} room 
 * @param {any} msg 
 */
util.logRoom = function (room, msg) {
    if (typeof msg !== 'string') msg = JSON.stringify(msg);

    console.log(room.name + ': ' + msg);
}

util.or = function (value, def) {
    return value === undefined ? def : value;
}

/**
 * @param {string[]} build 
 */
util.getBodyCost = function (build) {
    let sum = 0;
    for (let i = 0; i < build.length; i++) {
        sum += BODYPART_COST[build[i]];
    }
    return sum;
}

/**
 * @param {string} baseName
 */
util.getRandomName = function (baseName) {
    return '' + baseName + Math.floor(Math.random() * 1000);
}

/**
 * @param {string} template
 * @return {(c: Creep) => boolean}
 */
util.isCreepOfTemplate = function (template) {
    return c => c.memory.template === template;
}

/**
 * @param {Creep[]} creeps 
 * @param {RoomObject} target 
 */
util.getIndexOfClosestCreep = function (creeps, target) {
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
util.onInterval = function (interval, fn) {
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
util.onCacheInterval = function (interval, fn) {
    if (util.cacheTime % interval === 0) {
        fn();
        return true;
    }
    return false;
}

util.getDateCst = function (date = new Date()) {
    return new Date(date.getTime() - 5 * 3600 * 1000).toUTCString().replace('GMT', 'CST');
}

/**
 * @param {RoomPosition} a 
 * @param {RoomPosition} b
 */
util.arePositionsEqual = function (a, b) {
    return a.x == b.x && a.y == b.y && a.roomName == b.roomName;
}

/**
 * @param {string} memData 
 */
util.stringToPosition = function (memData) {
    try {
        let out = memData.split(',');
        return new RoomPosition(parseInt(out[0]), parseInt(out[1]), out[2]);
    }
    catch (e) { return null; }
}

/**
 * @param {RoomPosition} pos 
 */
util.positionToString = function (pos) {
    return pos.x + ',' + pos.y + ',' + pos.roomName;
}

/**
 * @param {function} run 
 * @param {function(Error)} [err] 
 */
util.invokeSafe = function (run, err) {
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
util.getField = function (obj, path, def = null) {
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
util.requireField = function (obj, path, def = {}) {
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
util.finishCreepTask = function (c) {
    delete c.memory.task;
}

/**
 * @param {Creep} creep 
 */
util.assignTaskToCreep = function (creep, taskInfo) {
    creep.memory.task = taskInfo;
    let status = statusShorthands[taskInfo.id] || taskInfo.id;

    creep.say(status);
}

/**
 * @param {Creep} creep 
 */
util.getCreepTaskName = function (creep) {
    let info = creep.memory.task || {};
    return info.id;
}

/**
 * @param {Creep} creep 
 */
util.getCreepTask = function (creep) {
    return creep.memory.task;
}

/**
 * @param {Creep} creep 
 */
util.doesCreepHaveTask = function (creep) {
    return Directive.getCreepTaskName(creep) != null;
}

util.doOrMoveTo = function (creep, target, action, opts = {}) {
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

/**
 * @param {Array} array, 
 * @param {function} fn 
 */
util.forEach = function(array, fn) {
    for (let i = 0; i < array.length; i++) {
        fn(array[i]); 
    }
}