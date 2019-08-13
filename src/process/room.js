'use strict' 

/**
 * @typedef ProcData JSON data 
 * @property {string} room The room name 
 * 
 * @typedef ProcCache Object data 
 * @property {Room} room The room object 
 */
class RoomProcess extends kernel.Process {

    get priority() {
        return PRIORITY_HIGH; 
    }

    get description() {
        return `Room process for ${this.data.room}`; 
    }

    create(args) {
        /**
         * @type {ProcData}
         */
        this.data = {
            room: args.room 
        }
    }

    reload() {
        /**
         * @type {ProcCache} 
         */
        this.cache = {
            room: Game.rooms[this.data.room]
        };
    }

    *run() {
        console.log(`Handling room ${this.cache.room.name}`); 
    }

}

module.exports = RoomProcess; 
