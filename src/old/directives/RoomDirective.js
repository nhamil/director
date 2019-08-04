'use strict' 

const Directive = require('./Directive'); 

const log = require('../log').createLogger('RoomDirective'); 

class RoomDirective extends Directive {

    constructor(name) {
        super(name); 

        this.rooms = {}; 
    }

    getRoomData(room) {
        this.rooms[room.name] = this.rooms[room.name] || {}; 
        return this.rooms[room.name]; 
    }

    preUpdateRoom(room, data) {} 

    updateRoom(room, data) {} 

    postUpdateRoom(room, data) {} 

    preUpdate() {
        for (let room of _.filter(Game.rooms, r => r.controller && r.controller.my)) this._run('preUpdateRoom', room); 
    }

    update() {
        for (let room of _.filter(Game.rooms, r => r.controller && r.controller.my)) this._run('updateRoom', room); 
    }

    postUpdate() {
        for (let room of _.filter(Game.rooms, r => r.controller && r.controller.my)) this._run('postUpdateRoom', room);  
    }

    _run(call, room) {
        try {
            this[call](room, this.getRoomData(room)); 
        }
        catch (e) {
            log.error('Exception thrown while running "' + call + '" on directive "' + this.name + '" for room "' + room.name + '": '); 
            log.error(e.stack.replace(/ \(eval.*\), /g, '').replace(/ \(blob.*\)/g, '').replace(/\)/g, ''));  
        }
    }

}

module.exports = RoomDirective; 