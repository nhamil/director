global.Travel = module.exports; 

let rooms = {};

const ROOM_WIDTH = 50; 
const ROOM_HEIGHT = 50; 
const ROOM_SIZE = ROOM_WIDTH * ROOM_HEIGHT; 

const DECAY = 150; 
const MAX_SCORE = 20; 
const INC_SCORE = 1; 
const ROAD_THRESHOLD = 9; 
const KEEP_THRESHOLD = 7; 

Travel.addMovementOnRoomPosition = function(pos) 
{
    Travel.addMovementOnPos(pos.x, pos.y, pos.roomName); 
}

Travel.addMovementOnPos = function(x, y, roomName) 
{
    let room = rooms[roomName]; 

    if (room) {
        let key = x + ',' + y;
        let val = room[key] || 0; 
        room[key] = Math.min(val + INC_SCORE, MAX_SCORE); 
    }
}

Travel.getPosScore = function(pos) 
{
    let room = rooms[pos.roomName]; 
    if (room) 
    {
        return room[pos.x + ',' + pos.y]; 
    }
    else 
    {
        return 0; 
    }
}

Travel.shouldPosHaveRoad = function(x, y, roomName) 
{
    return Travel.getPosScore({x, y, roomName}) >= ROAD_THRESHOLD; 
}

Travel.shouldPosKeepRoad = function(x, y, roomName) 
{
    return Travel.getPosScore({x, y, roomName}) >= KEEP_THRESHOLD; 
}

Travel.preFrame = function() 
{
    Memory.rooms = Memory.rooms || {};  
    for (let name in Memory.rooms) {
        if (!Game.rooms[name]) {
            if (Memory.rooms[name].map) delete Memory.rooms[name].map; 
        }
    }
    for (let name in Game.rooms) 
    {
        let map = {}; 

        let mem = Memory.rooms[name] = Memory.rooms[name] || {}; 
        if (mem.map) 
        {
            for (let key in mem.map) {
                map[key] = parseInt(mem.map[key]) || 0; 
            }
        }

        if (Game.time % DECAY === 0) {
            for (let i in map) map[i] = Math.max(0, map[i] - 1); 
        }

        rooms[name] = map; 
    }
    if (Game.time % DECAY === 0) console.log('Decaying travel paths'); 
}

Travel.postFrame = function() 
{
    for (let name in Game.rooms) 
    {
        let map = rooms[name]; 

        let mem = Memory.rooms[name] = Memory.rooms[name] || {}; 

        if (map) {
            for (let i in map) if (!map[i]) delete map[i]; 
            mem.map = map; 
        }
    }
} 

/**
 * @param {Room} room 
 */
Travel.drawVisuals = function(room) 
{
    // let scores = rooms[room.name] || []; 
    // // if (scores) 
    // {
    //     let max = MAX_SCORE; 
    //     // if (scores) for (let i = 0; i < scores.length; i++) max = Math.max(max, scores[i]); 

    //     for (let y = 0; y < ROOM_HEIGHT; y++) 
    //     {
    //         for (let x = 0; x < ROOM_WIDTH; x++) 
    //         {
    //             let score = scores[x + y * ROOM_WIDTH];// || Math.random(); 
    //             let s = score / max; 
    //             // s = (score >= ROAD_THRESHOLD) ? 1 : (score >= KEEP_THRESHOLD) ? 0.5 : 0; 
    //             s = scale(s, 0, 1, 0.666, 0.0); 
    //             room.visual.rect(x - 0.5, y - 0.5, 1, 1, {
    //                 fill: HsvToRgbHex(s, 1, 1), 
    //                 opacity: 0.2 
    //             }); 
    //         }
    //     }
    // }
}

// [0, 1] for all 
// https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
function HsvToRgbHex(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    let out = {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
    
    return '#' + (out.r << 16 | out.g << 8 | out.b).toString(16).padStart(6, '0'); 
}

// https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers
function scale(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}