'use strict' 

const Process = require('../os/process'); 
const Queue = require('../queue'); 

global.clearRoomEval = function() {
    delete Memory.roomEval; 
    return true; 
}

global.setRoomEval = function(name, x, y) {
    Memory.roomEval = util.getRoomPositionWriteData(new RoomPosition(x, y, name)); 
    return true; 
}

/**
 * @returns {number[][]}
 */
function createMatrix() {
    let out = []; 
    out.length = 50; 
    for (let i = 0; i < 50; i++) {
        let arr = []; 
        arr.length = 50; 
        arr.fill(0); 
        out[i] = arr; 
    }
    return out; 
}

function copyMatrix(to, from) {
    for (let y = 0; y < 50; y++) {
        for (let x = 0; x < 50; x++) {
            to[x][y] = from[x][y]; 
        }
    }
}

function clearMatrix(m, val = 0) {
    for (let y = 0; y < 50; y++) {
        for (let x = 0; x < 50; x++) {
            m[x][y] = val; 
        }
    }
}

const mincut = require('./util_mincut'); 

class RoomEvalProcess3 extends Process {

    run() {
        if (!Memory.roomEval) {
            return; 
        }

        let center = util.getRoomPositionReadData(Memory.roomEval); 
        if (!center) {
            this.log("Could not parse room eval request"); 
            clearRoomEval(); 
            return; 
        }

        mincut.GetCutTiles(center.roomName, [{
            x1: center.x - 10, 
            y1: center.y - 10, 
            x2: center.x + 10, 
            y2: center.y + 10
        }]);
    }

}

class RoomEvalProcess2 extends Process {

    reload() {
        this.colors = {}; 
        for (let i = -5000; i < 5000; i++) {
            this.colors[i] = util.randomColor(); 
        }
    }

    run() {
        if (!Memory.roomEval) {
            delete this.edges; 
            return; 
        }

        let center = util.getRoomPositionReadData(Memory.roomEval); 
        if (!center) {
            this.log("Could not parse room eval request"); 
            clearRoomEval(); 
            delete this.edges; 
            return; 
        }

        if (!this.edges) {
            this.edges = new EdgeList([center.x, center.y]); 
        }

        this.visual = new RoomVisual(center.roomName); 

        let terrain = new Room.Terrain(center.roomName); 
        // this.edges.terrain = terrain; 

        // this.edges.iterate(); 
        // let map = this.edges.iterMap; 

        let map = createMatrix(); 
        let mapLast = createMatrix(); 
        let sections = createMatrix(); 

        let exitMap = createMatrix(); 
        let exitList = []; 

        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                if (terrain.get(x, y) !== TERRAIN_MASK_WALL && (x === 0 || x === 49 || y === 0 || y === 49)) {
                    exitList.push([x,y]); 
                }
            }
        }
        this.computeExitMap(terrain, exitMap, exitList); 

        copyMatrix(map, exitMap); 

        // for (let i = 0; i < 25; i++) {
        //     copyMatrix(mapLast, map); 

        //     for (let y = 1; y < 49; y++) {
        //         for (let x = 1; x < 49; x++) {
        //             if (terrain.get(x, y) !== TERRAIN_MASK_WALL && map[x][y] === -1) {
        //                 let val = Infinity; 
        //                 if (mapLast[x-1][y] !== -1) val = Math.min(val, mapLast[x-1][y]); 
        //                 if (mapLast[x+1][y] !== -1) val = Math.min(val, mapLast[x+1][y]); 
        //                 if (mapLast[x][y-1] !== -1) val = Math.min(val, mapLast[x][y-1]); 
        //                 if (mapLast[x][y+1] !== -1) val = Math.min(val, mapLast[x][y+1]); 
        //                 if (val < Infinity) {
        //                     map[x][y] = val + 1; 
        //                 }
        //             } 
        //         }
        //     }
        // }

        // for (let y = 1; y < 49; y++) {
        //     for (let x = 1; x < 49; x++) {
        //         if (map[x][y] === 0) continue; 
        //         let val = map[x][y]; 
        //         let peak = true; 
        //         loop: 
        //         for (let ya = -1; ya <= 1; ya++) {
        //             for (let xa = -1; xa <= 1; xa++) {
        //                 if (map[x+xa][y+ya] > map[x][y]) {
        //                     peak = false; 
        //                     break loop; 
        //                 }
        //             }
        //         }
        //         sections[x][y] = peak ? 1 : 0; 
        //     }
        // }

        // for (let y = 0; y < 50; y++) {
        //     for (let x = 0; x < 50; x++) {
        //         if (terrain.get(x, y) !== TERRAIN_MASK_WALL && !(x === 0 || x === 49 || y === 0 || y === 49)) {
        //             map[x][y] = -1; 
        //         }
        //         if (sections[x][y] > 0) {
        //             map[x][y] = 0; 
        //         }
        //     }
        // }

        // for (let i = 0; i < 25; i++) {
        //     copyMatrix(mapLast, map); 

        //     for (let y = 1; y < 49; y++) {
        //         for (let x = 1; x < 49; x++) {
        //             if (terrain.get(x, y) !== TERRAIN_MASK_WALL && map[x][y] === -1) {
        //                 let val = Infinity; 
        //                 if (mapLast[x-1][y] !== -1) val = Math.min(val, mapLast[x-1][y]); 
        //                 if (mapLast[x+1][y] !== -1) val = Math.min(val, mapLast[x+1][y]); 
        //                 if (mapLast[x][y-1] !== -1) val = Math.min(val, mapLast[x][y-1]); 
        //                 if (mapLast[x][y+1] !== -1) val = Math.min(val, mapLast[x][y+1]); 
        //                 if (val < Infinity) {
        //                     map[x][y] = val + 1; 
        //                 }
        //             } 
        //         }
        //     }
        // }

        // for (let y = 1; y < 49; y++) {
        //     for (let x = 1; x < 49; x++) {
        //         if (map[x][y] === 0) continue; 
        //         let val = map[x][y]; 
        //         let peak = true; 
        //         loop: 
        //         for (let ya = -1; ya <= 1; ya++) {
        //             for (let xa = -1; xa <= 1; xa++) {
        //                 if (map[x+xa][y+ya] > map[x][y]) {
        //                     peak = false; 
        //                     break loop; 
        //                 }
        //             }
        //         }
        //         sections[x][y] = peak ? 1 : 0; 
        //     }
        // }

        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                if (map[x][y] !== 0) {
                    // if (terrain.get(x - 1, y) !== TERRAIN_MASK_WALL || 
                    //     terrain.get(x + 1, y) !== TERRAIN_MASK_WALL || 
                    //     terrain.get(x, y - 1) !== TERRAIN_MASK_WALL || 
                    //     terrain.get(x, y + 1) !== TERRAIN_MASK_WALL) {
                    //         this.drawTile(x, y, this.colors[map[x][y]]); 
                    // }
                    // this.drawTile(x, y, this.colors[map[x][y]]); 

                    this.drawText('' + map[x][y], x, y, 'gray'); 
                }
            }
        }
    }

    /**
     * @param {Room.Terrain} terrain
     * @param {number[][]} map 
     */
     computeExitMap(terrain, map, posList, id) {
        let used = {}; 
        let queue = new Queue(); 
        for (let pos of posList) {
            queue.enqueue([pos, 0]); 
            used[`${pos}`] = true; 
        }

        let neighbors = [
            [-1,  0], 
            [ 1,  0], 
            [ 0, -1], 
            [ 0,  1]
        ]; 

        // used[`${stack[0]}`] = true; 
        while (queue.length > 0) {
            let pos = queue.dequeue();  
            let level = pos[1]; 
            pos = pos[0]; 
            map[pos[0]][pos[1]] = level; 

            for (let add of neighbors) {
                let xx = pos[0] + add[0]; 
                let yy = pos[1] + add[1]; 
                if (xx >= 0 && xx <= 49 && yy >= 0 && yy <= 49) {
                    let newPos = [xx, yy]; 
                    if (map[xx][yy] === 0 && terrain.get(xx, yy) !== TERRAIN_MASK_WALL && !used[`${newPos}`]) {
                        used[`${newPos}`] = true; 
                        queue.enqueue([newPos, level+1]); 
                    }
                }
            }
        }
    }

    drawTile(x, y, color) {
        this.visual.rect(x - 0.5, y - 0.5, 1, 1, {
            fill: color 
        })
    }

    drawText(text, x, y, color) {
        this.visual.text(text, x - 0.5, y + 0.5, {
            color: color 
        })
    }

}

class RoomEvalProcess extends Process {

    reload() {
        this.colors = {}; 
        for (let i = -5000; i < 5000; i++) {
            this.colors[i] = util.randomColor(); 
        }

        if (!this.data.conn) this.data.conn = -1; 
    }

    run() {
        if (!Memory.roomEval) return; 

        this.data.conn++; 

        this.id = 2; 
        this.wallId = -1; 

        let center = util.getRoomPositionReadData(Memory.roomEval); 
        if (!center) {
            this.log("Could not parse room eval request"); 
            clearRoomEval(); 
            return; 
        }

        this.visual = new RoomVisual(center.roomName); 

        let terrain = new Room.Terrain(center.roomName); 

        let map = this.createMatrix(); 
        let wallEdges = {}; 
        let wallConns = {}; 

        // find all separated walls 
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
                    if (map[x][y] === 0) {
                        this.fillWall(terrain, map, x, y, this.getWallId()); 
                    }
                }
            }
        }

        // find edges of walls 
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
                    let id = map[x][y]; 
                    if (id < 0) {
                        if (terrain.get(x - 1, y) !== TERRAIN_MASK_WALL || 
                            terrain.get(x + 1, y) !== TERRAIN_MASK_WALL || 
                            terrain.get(x, y - 1) !== TERRAIN_MASK_WALL || 
                            terrain.get(x, y + 1) !== TERRAIN_MASK_WALL) {
                                if (!wallEdges[id]) wallEdges[id] = []; 
                                wallEdges[id].push([x,y]); 
                        }
                    }
                }
            }
        }

        // find closest points of wall edges 
        for (let src = -1; src > this.wallId; src--) {
            for (let dst = src - 1; dst > this.wallId; dst--) {
                let bestDist = Infinity; 
                let bestSrc = null; 
                let bestDst = null; 

                for (let sPos of wallEdges[src]) {
                    for (let dPos of wallEdges[dst]) {
                        let dist = util.manhattanDistance(sPos[0], sPos[1], dPos[0], dPos[1]); 
                        if (dist < bestDist) {
                            bestSrc = sPos; 
                            bestDst = dPos; 
                            bestDist = dist; 
                        }
                    }
                }

                let conn = [bestSrc, bestDst]; 
                wallConns[`${src},${dst}`] = conn; 
                // wallConns[`${dst},${src}`] = conn; 
            }
        }

        for (let connId in wallConns) {
            function moveCloser(pos, target) {
                if (pos[0] < target[0]) pos[0]++; 
                if (pos[0] > target[0]) pos[0]--; 
                if (pos[1] < target[1]) pos[1]++; 
                if (pos[1] > target[1]) pos[1]--; 
            }

            function posEqual(a, b) {
                return a[0] == b[0] && a[1] == b[1]; 
            }

            let conn = wallConns[connId]; 

            let pos = [...conn[0]]; 
            let target = conn[1]; 
            let noCollision = true; 
            moveCloser(pos, target);
            while (!posEqual(pos, target)) {
                if (terrain.get(pos[0], pos[1]) === TERRAIN_MASK_WALL) {
                    noCollision = false; 
                    break; 
                }
                moveCloser(pos, target); 
            }

            if (noCollision) {
                pos = [...conn[0]]; 
                moveCloser(pos, target);
                while (!posEqual(pos, target)) {
                    map[pos[0]][pos[1]] = 1; 
                    moveCloser(pos, target); 
                }
            }
        }

        // flood fill exit areas 
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                if ((x === 0 || x === 49 || y === 0 || y === 49) && terrain.get(x, y) !== TERRAIN_MASK_WALL) {
                    if (map[x][y] === 0) {
                        this.fillOpen(terrain, map, x, y, this.getId()); 
                    }
                }
            }
        }

        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                // if (terrain.get(x, y) !== TERRAIN_MASK_WALL && 
                //     (terrain.get(x - 1, y) === TERRAIN_MASK_WALL || 
                //      terrain.get(x + 1, y) === TERRAIN_MASK_WALL || 
                //      terrain.get(x, y - 1) === TERRAIN_MASK_WALL || 
                //      terrain.get(x, y + 1) === TERRAIN_MASK_WALL)) {
                //         this.drawTile(x, y, 'red'); 
                // }

                if (map[x][y] !== 0) {
                    if (terrain.get(x - 1, y) !== TERRAIN_MASK_WALL || 
                        terrain.get(x + 1, y) !== TERRAIN_MASK_WALL || 
                        terrain.get(x, y - 1) !== TERRAIN_MASK_WALL || 
                        terrain.get(x, y + 1) !== TERRAIN_MASK_WALL) {
                            this.drawTile(x, y, this.colors[map[x][y]]); 
                    }
                }
            }
        }
    }

    createMatrix() {
        let out = []; 
        out.length = 50; 
        for (let i = 0; i < 50; i++) {
            let arr = []; 
            arr.length = 50; 
            arr.fill(0); 
            out[i] = arr; 
        }
        return out; 
    }

    getId() {
        return this.id++; 
    }

    getWallId() {
        return this.wallId--; 
    }

    /**
     * @param {Room.Terrain} terrain
     * @param {number[][]} map 
     */
    fillWall(terrain, map, x, y, id) {
        // function _fill(x, y, used) {
        //     map[x][y] = id; 
        //     used[`${x},${y}`] = true; 
        //     if (x >= 1 && terrain.get(x - 1, y) === TERRAIN_MASK_WALL && !used[`${x-1},${y}`] && map[x-1][y] === 0) _fill(x - 1, y, used); 
        //     // if (x <= 49 && terrain.get(x + 1, y) && !used[`${x+1},${y}`] && map[x+1][y] === 0) _fill(x + 1, y, used); 
        //     // if (y >= 1 && terrain.get(x, y - 1) && !used[`${x},${y-1}`] && map[x][y-1] === 0) _fill(x, y - 1, used); 
        //     // if (y <= 49 && terrain.get(x, y + 1) && !used[`${x},${y+1}`] && map[x][y+1] === 0) _fill(x, y + 1, used); 
        // }

        let used = {}; 
        /** @type {number[][]} */
        let stack = [[x,y]]; 

        let neighbors = [
            [-1,  0], 
            [ 1,  0], 
            [ 0, -1], 
            [ 0,  1]
        ]; 

        used[`${stack[0]}`] = true; 
        while (stack.length > 0) {
            let pos = stack.pop(); 
            map[pos[0]][pos[1]] = id; 

            for (let add of neighbors) {
                let xx = pos[0] + add[0]; 
                let yy = pos[1] + add[1]; 
                if (xx >= 0 && xx <= 49 && yy >= 0 && yy <= 49) {
                    let newPos = [xx, yy]; 
                    if (map[xx][yy] === 0 && terrain.get(xx, yy) === TERRAIN_MASK_WALL && !used[`${newPos}`]) {
                        used[`${newPos}`] = true; 
                        stack.push(newPos); 
                    }
                }
            }
        }
    }

    /**
     * @param {Room.Terrain} terrain
     * @param {number[][]} map 
     */
     fillOpen(terrain, map, x, y, id) {
        let used = {}; 
        /** @type {number[][]} */
        let stack = [[x,y]]; 

        let neighbors = [
            [-1,  0], 
            [ 1,  0], 
            [ 0, -1], 
            [ 0,  1]
        ]; 

        used[`${stack[0]}`] = true; 
        while (stack.length > 0) {
            let pos = stack.pop(); 
            map[pos[0]][pos[1]] = id; 

            for (let add of neighbors) {
                let xx = pos[0] + add[0]; 
                let yy = pos[1] + add[1]; 
                if (xx >= 0 && xx <= 49 && yy >= 0 && yy <= 49) {
                    let newPos = [xx, yy]; 
                    if (map[xx][yy] === 0 && terrain.get(xx, yy) !== TERRAIN_MASK_WALL && !used[`${newPos}`]) {
                        used[`${newPos}`] = true; 
                        stack.push(newPos); 
                    }
                }
            }
        }
    }

    drawTile(x, y, color) {
        this.visual.rect(x - 0.5, y - 0.5, 1, 1, {
            fill: color 
        })
    }

}

module.exports = RoomEvalProcess3; 