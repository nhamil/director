'use strict' 

/** 
 * @typedef Data
 * @property {number} test 
 */
class Main extends kernel.Process {

    get description() {
        return 'Main process'; 
    }

    get priority() {
        return PRIORITY_HIGHEST; 
    }

    *run() {
        yield this.handleRooms(); 
    }

    handleRooms() {
        for (let name in Game.rooms) {
            let room = Game.rooms[name]; 

            if (room.controller && room.controller.my) {
                this.startChildProcess(`room_${name}`, './room', {
                    room: name 
                });
            }
        }
    }

}

module.exports = Main; 
