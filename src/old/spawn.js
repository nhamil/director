'use strict' 

const priority = require('./priority'); 

class SpawnRequest {
    /**
     * @param {Room} room 
     * @param {Role} role 
     * @param {boolean} now 
     * @param {string} priority 
     */
    constructor(room, role, now, priority) {
        this.room = room; 
        this.role = role; 
        this.now = now; 
        this.priority = priority; 
    }
    toString() {
        return '[room:' + this.room.name + ', role:' + this.role.name + ', now:' + this.now + ', priority:' + this.priority + ']'; 
    }
}

class SpawnManager {

    constructor() {
        this.clearRequests(); 
    }

    clearRequests() {
        this.requests = []; 
        this.sort = false; 
    }

    /**
     * @param {Room} room 
     * @param {Role} role 
     * @param {SpawnRequestOptions} opts 
     */
    addRequest(room, role, opts = {}) {
        _.defaults(opts, {
            now: false, 
            priority: priority.MEDIUM 
        });

        let req = new SpawnRequest(
            room, 
            role, 
            opts.now, 
            opts.priority 
        ); 

        this.requests.push(req); 
        this.sort = true; 
    }

    /**
     * @param {Room} room 
     * @returns {SpawnRequest} 
     */
    getRequest(room) {
        this.sortRequests(); 

        for (let i = 0; i < this.requests.length; i++) {
            let req = this.requests[i]; 
            if (req.room === room) {
                this.requests.splice(i); 
                return req; 
            }
        }

        return null; 
    }

    sortRequests() {
        if (this.sort) {
            this.sort = false; 
            priority.sort(this.requests); 
        }
    }

}

module.exports = new SpawnManager(); 
