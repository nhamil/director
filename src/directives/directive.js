'use strict'

const util = require('../util');

/**
 * @typedef SpawnRequest 
 * 
 * @property {Room} room 
 * @property {String} templateName 
 * @property {Boolean} now 
 * @property {Number} priority 
 */

/**
 * @type {SpawnRequest[]} 
 */
let spawnRequests;
let sortRequests = false; 

function resetQueue() {
    spawnRequests = [];
    sortRequests = false; 
}

/**
 * @param {Room} room 
 * @param {String} templateName 
 * @param {Object} opts 
 */
function requestSpawn(room, templateName, opts = {}) {
    opts = opts || {}; 
    _.defaults(opts, {
        now: false, 
        priority: 1000 
    });

    spawnRequests.push({
        room, 
        templateName, 
        now: opts.now, 
        priority: opts.priority 
    }); 
    sortRequests = true; 
}

/**
 * @param {Room} room 
 * @returns {SpawnRequest} 
 */
function getSpawnRequest(room) {
    if (sortRequests) {
        spawnRequests.sort((a, b) => a.priority - b.priority); 
    }

    for (let i = 0; i < spawnRequests.length; i++) {
        let req = spawnRequests[i]; 

        if (req.room === room) {
            spawnRequests.splice(i, 1); 
            return req; 
        }
    }

    return null; 
}

class Directive {

    /** 
     * @param {Room} room
    */
    constructor(room) {
        this.room = room;
    }

    static onFrame() {
        resetQueue(); 
    }

    preFrame() { }

    update() { }

    postFrame() { }

    get rcl() {
        return this.room.controller.level;
    }

    get data() {
        return this.room.memory = this.room.memory || {}; 
    }

    requestSpawn(templateName, opts = {}) {
        requestSpawn(this.room, templateName, opts);
    }

    getSpawnRequest() {
        return getSpawnRequest(this.room);
    }

    /**
     * @param {string} templateName 
     * @returns {Creep[]} 
     */
    getCreepsByTemplate(templateName) {
        return [];
    }

    /**
     * @param {string} templateName 
     * @returns {Creep[]} 
     */
    getIdleCreepsByTemplate(templateName) {
        return []
    }

    /**
     * @param {string} taskName 
     * @returns {Creep[]} 
     */
    getCreepsByTask(taskName) {
        return []
    }



}

module.exports = Directive; 