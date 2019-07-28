'use strict' 

/**
 * @param {any} msg
 */
function write(msg) {
    if (typeof msg !== 'string') msg = JSON.stringify(msg); 

    console.log(msg); 
}

/**
 * @param {Room|string} room 
 * @param {any} msg 
 */
function writeRoom(room, msg) {
    if (typeof msg !== 'string') msg = JSON.stringify(msg); 
    if (typeof room !== 'string') room = room.name; 

    console.log(room + ': ' + msg); 
}

module.exports = {
    write, 
    writeRoom 
};