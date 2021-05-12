'use strict' 

/**
 * @typedef SpawnRequest 
 * @property {string} room 
 * @property {string} role 
 * @property {boolean} needNow 
 * @property {number} priority
 * @property {boolean} taken 
 * @property {Object} data 
 */ 

/** @type {SpawnRequest[]} */
const spawnQueue = []; 
let needsSorting = false; 

module.exports = {
    _sq: spawnQueue, 

    CRITICAL_PRIORITY: 100, 
    HIGH_PRIORITY: 200, 
    MEDIUM_PRIORITY: 300, 
    LOW_PRIORITY: 400, 

    PRIORITY_MINER: 190, 
    PRIORITY_HAULER: 195, 
    PRIORITY_WORKER: 295, 

    clear: function() {
        spawnQueue.length = 0; 
    }, 

    /**
     * @param {Room} room Room the creep is for 
     * @param {string} role Creep role
     * @param {boolean} needNow Should the room not wait for optimal spawning
     * @param {number} priority Spawn priority 
     */
    request: function(room, role, needNow = false, priority = 300, data = null) {
        spawnQueue.push({
            room: room.name, 
            role: role, 
            needNow: needNow, 
            priority: priority, 
            taken: false, 
            data: data || {}  
        }); 
        needsSorting = true; 
    }, 

    /**
     * @param {Room} room 
     * @returns {boolean}
     */
    doesRoomHaveRequest: function(room) {
        for (let i = 0; i < spawnQueue.length; i++) {
            if (spawnQueue[i].room === room.name) return true; 
        }

        return false; 
    }, 

    /**
     * @param {Room} room 
     * @returns {SpawnRequest}
     */
    getRequestForRoom: function(room) {
        if (needsSorting) {
            spawnQueue.sort((a, b) => a.priority - b.priority); 
            needsSorting = false; 
        }

        for (let i = 0; i < spawnQueue.length; i++) {
            let req = spawnQueue[i]; 
            if (req.room === room.name) {
                req.taken = true; 
                return req; 
            }
        }

        return null; 
    }
};