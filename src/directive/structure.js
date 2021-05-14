'use strict' 

const Directive = require('./directive'); 
const spawnQueue = require('../../spawnqueue'); 
const Queue = require('../../queue'); 
const util = require('../util'); 

const ROAD_COST = 2; 
const OPEN_COST = 3; 
const VERSION = 8; 

const INDEX_TO_STRUCTURE = [
    STRUCTURE_ROAD, 
    STRUCTURE_SPAWN, 
    STRUCTURE_POWER_SPAWN, 
    STRUCTURE_TOWER, 
    STRUCTURE_EXTENSION, 
    STRUCTURE_STORAGE, 
    STRUCTURE_LINK, 
    STRUCTURE_OBSERVER, 
    STRUCTURE_FACTORY, 
    STRUCTURE_TERMINAL, 
    STRUCTURE_NUKER
]

/** @type {Object<string, number>} */
const STRUCTURE_TO_INDEX = {}; 
for (let i = 0; i < INDEX_TO_STRUCTURE.length; i++) {
    STRUCTURE_TO_INDEX[INDEX_TO_STRUCTURE[i]] = i; 
}

const SITE_SORT = {
    [STRUCTURE_CONTAINER]: 100, 
    [STRUCTURE_ROAD]: 300, 
    [STRUCTURE_EXTENSION]: 200, 
    [STRUCTURE_STORAGE]: 50, 
    [STRUCTURE_TOWER]: 70 
};

function getSiteImportance(type) {
    return SITE_SORT[type] || 0; 
}

/** 
 * TODO planRoom
 */ 
class StructureDirective extends Directive {

    run() {
        this.handleSources(); 
        this.handleBuilding(); 
        this.handleRepairs(); 
    }

    handleSources() {
        /**
         * @param {Source} source 
         */
        function chooseSourceContainerLocation(source) {
            let controller = source.room.controller; 

            if (controller) {
                let path = PathFinder.search(source.pos, controller.pos); 

                if (path && path.path && path.path.length > 0) {
                    return path.path[0]; 
                }
                else {
                    console.log('Could not find path from source to controller in room ' + source.room.name + '. This shouldn\'t be possible'); 
                }
            }
        }

        let room = this.room; 
        let sources = room.find(FIND_SOURCES); 

        let mem = room.memory; 
        mem.sourceContainers = mem.sourceContainers || {}; 

        for (let i in sources) {
            let source = sources[i]; 
            let posData = mem.sourceContainers[source.id]; 
            if (!posData) {
                // no container or construction site, add one 
                let pos = chooseSourceContainerLocation(source); 

                if (pos) {
                    // console.log('Create source container construction site at ' + posData); 
                    pos.createConstructionSite(STRUCTURE_CONTAINER); 
                    mem.sourceContainers[source.id] = util.getRoomPositionWriteData(pos, false); 
                }
            }
            else {
                let pos = util.getRoomPositionReadData(posData); 
                if (pos.findInRange(FIND_STRUCTURES, 0, { filter: s => s.structureType === STRUCTURE_CONTAINER }).length === 0) {
                    if (pos.findInRange(FIND_CONSTRUCTION_SITES, 0).length === 0) 
                    {
                        // console.log('Create source container construction site at ' + posData); 
                        pos.createConstructionSite(STRUCTURE_CONTAINER); 
                    }
                }
            }
        }
    }

    handleRepairs() {
        let room = this.room; 

        let creeps = this.getCreepsByHomeAndRole(room, ['repairer', 'builder']); 
        let repairers = creeps.filter(i => this.getRole(i) === 'repairer'); 

        let needRepairs = room.find(FIND_STRUCTURES, {
            filter: s => s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART && s.hits < s.hitsMax
        });
        needRepairs.sort((a, b) => a.hits/a.hitsMax < b.hits/b.hitsMax ? -1 : 1); 

        if (needRepairs.length > 0) {
            this.worstRepair = needRepairs[0].hits/needRepairs[0].hitsMax; 
        }
        else {
            this.worstRepair = 1.0; 
        }

        if (Game.time % 100 === 0) this.log(needRepairs.length + " structures need repairs, worst at " + Math.round(this.worstRepair*100) + "%"); 

        let towers = room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_TOWER && s.store.energy > 0
        }); 

        if (towers.length > 0) {
            for (let i = 0; i < Math.min(needRepairs.length, towers.length); i++) {
                towers[i].repair(needRepairs[i]); 
            }
        }
        else if (needRepairs.length > 0) {
            if (repairers.length < 1) {
                spawnQueue.request(room, 'repairer', needRepairs[0].hits/needRepairs[0].hitsMax < 0.1, needRepairs[0].hits/needRepairs[0].hitsMax < 0.3 ? spawnQueue.HIGH_PRIORITY : spawnQueue.MEDIUM_PRIORITY); 
            }

            let idle = creeps.filter(i => !this.hasTask(i)); 
            for (let i = 0; i < Math.min(needRepairs.length, idle.length); i++) {
                this.assignTask(idle[i], 'repair', { target: needRepairs[i].id }); 
            }
        }
    }

    handleBuilding() {
        let room = this.room; 

        let roles = ['builder']; 

        if (room.controller.ticksToDowngrade > 3000) roles.push('general'); 
        if (this.worstRepair > 0.8) roles.push('repairer'); 

        let creeps = this.getCreepsByHomeAndRole(room, roles); 
        
        if (creeps.length < 2) {
            spawnQueue.request(room, 'builder', false, spawnQueue.HIGH_PRIORITY); 
        }

        if (!room.memory.layout || !room.memory.layout.version || room.memory.layout.version != VERSION) {
            this.log("Planning room"); 
            this.planRoom(room.name); 
        }

        let sites = room.find(FIND_MY_CONSTRUCTION_SITES); 
        sites.sort((a, b) => getSiteImportance(b.structureType) - getSiteImportance(a.structureType)); 
        let target = sites[0]; 

        if (target) {
            for (let creep of creeps) {
                if (!this.hasTask(creep)) {
                    this.assignTask(creep, 'build', {
                        target: target.id 
                    }); 
                }
            }
        }
        else {
            this.createConstructionSite(); 
        }
    }

    createConstructionSite() {
        // TODO check what can be built for current RCL 
        let room = this.room; 
        let rcl = room.controller.level; 

        let currentStructures = room.find(FIND_STRUCTURES); 

        let canBuild = {}; 
        for (let i in CONTROLLER_STRUCTURES) {
            canBuild[i] = currentStructures.reduce((n, s) => n + (s.structureType === i), 0) < CONTROLLER_STRUCTURES[i][rcl]
        }
        //     [STRUCTURE_ROAD]: currentStructures.reduce((n, s) => n + (s.structureType === STRUCTURE_ROAD), 0) < CONTROLLER_STRUCTURES[STRUCTURE_ROAD][rcl], 
        //     [STRUCTURE_EXTENSION]: currentStructures.reduce((n, s) => n + (s.structureType === STRUCTURE_EXTENSION), 0) < CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][rcl], 
        //     [STRUCTURE_TOWER]: currentStructures.reduce((n, s) => n + (s.structureType === STRUCTURE_TOWER), 0) < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl], 
        //     [STRUCTURE_STORAGE]: currentStructures.reduce((n, s) => n + (s.structureType === STRUCTURE_STORAGE), 0) < CONTROLLER_STRUCTURES[STRUCTURE_STORAGE][rcl], 

        //     [STRUCTURE_TERMINAL]: currentStructures.reduce((n, s) => n + (s.structureType === STRUCTURE_TOWER), 0) < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl], 
        //     [STRUCTURE_FACTORY]: currentStructures.reduce((n, s) => n + (s.structureType === STRUCTURE_TOWER), 0) < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl], 
        //     [STRUCTURE_OBSERVER]: currentStructures.reduce((n, s) => n + (s.structureType === STRUCTURE_TOWER), 0) < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl], 
        //     [STRUCTURE_TOWER]: currentStructures.reduce((n, s) => n + (s.structureType === STRUCTURE_TOWER), 0) < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl], 
        //     [STRUCTURE_TOWER]: currentStructures.reduce((n, s) => n + (s.structureType === STRUCTURE_TOWER), 0) < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl], 
        //     [STRUCTURE_TOWER]: currentStructures.reduce((n, s) => n + (s.structureType === STRUCTURE_TOWER), 0) < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl], 
        //     [STRUCTURE_TOWER]: currentStructures.reduce((n, s) => n + (s.structureType === STRUCTURE_TOWER), 0) < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl], 
        // }; 

        let sites = []; 
        let positions = []; 
        let highestPriority = -Infinity; 

        /** @type {string} */
        let site; 
        for (let i = 0; i < room.memory.layout.structures.length; i++) {
            site = room.memory.layout.structures[i]
            let args = site.split(','); 
            for (let i = 0; i < args.length; i++) {
                args[i] = parseInt(args[i]); 
            }
            let type = INDEX_TO_STRUCTURE[args[2]]; 
            let pri = getSiteImportance(type); 

            if (canBuild[type] && pri >= highestPriority) {
                let onTile = room.lookAt(args[0], args[1]); 
                let possible = !onTile.some(elem => elem.type === 'structure' || elem.type === 'constructionSite'); 

                if (possible) {
                    if (pri > highestPriority) {
                        sites = []; 
                        positions = []; 
                    }
                    highestPriority = pri; 
                    let site = { type: type, index: i, pos: new RoomPosition(args[0], args[1], room.name)}; 
                    sites.push(site); 
                    positions.push(site.pos); 
                }
            }
        }

        // this.log(positions); 

        if (sites.length > 0) {
            // if (Game.time % 50 === 0) this.log("Trying to create " + bestType); 

            let sources = room.find(FIND_SOURCES); 

            let bestPos = positions[0]; 
            let bestDist = Infinity; 

            for (let source of sources) {
                let pos = source.pos.findClosestByPath(positions, { ignoreCreeps: true }); 
                // this.log(source.pos + ": " + pos); 
                if (pos) {
                    let dist = source.pos.findPathTo(pos).length; 
                    if (dist !== undefined && dist < bestDist) {
                        bestPos = pos; 
                        bestDist = dist; 
                    }
                }
            }

            let bestSite = _.min(sites, s => s.pos.getRangeTo(bestPos)); 
            // this.log("Best pos: " + bestPos + " (" + bestDist + ")"); 
            this.log("Best site: " + JSON.stringify(bestSite)); 
            this.log("Construction site creation: " + room.createConstructionSite(bestSite.pos, bestSite.type)); 

            // let bestSite = _.minBy(sites, function(site) {
            //     let min = Infinity, dist; 
            //     for (let source of sources) {
            //         dist = source.pos.findClosestByPath()
            //     }
            // }); 

            // room.createConstructionSite(x, y, bestType); 
        }
    }

    // TODO check that everything is reachable 
    planRoom(roomName) {
        let vis = new RoomVisual(roomName); 

        let cost = new PathFinder.CostMatrix(); 
        let terrain = new Room.Terrain(roomName); 

        let opts = {
            roomCallback: room => cost, 
            plainCost: OPEN_COST, 
            swampCost: OPEN_COST, 
            maxRooms: 1
        };

        if (Game.rooms[roomName]) {
            let room = Game.rooms[roomName]; 
            let layout = {
                version: VERSION, 
                structures: [] 
            };

            let center = {
                pos: new RoomPosition(43, 38, roomName) 
            }; 
            center = room.find(FIND_MY_SPAWNS)[0]; 

            function valid(x, y) {
                return (x + y) % 2 === 1 || (x % 4 == 0 && y % 4 == 0) || (x % 4 == 2 && y % 4 == 2); 
            }

            let color = {
                [STRUCTURE_ROAD]: '#ffffff', 
                [STRUCTURE_SPAWN]: '#0000ff', 
                [STRUCTURE_POWER_SPAWN]: '#ff00ff', 
                [STRUCTURE_TOWER]: '#ff7f00', 
                [STRUCTURE_EXTENSION]: '#ffff00', 
                [STRUCTURE_STORAGE]: '#00ffff', 
                [STRUCTURE_LINK]: '#00ff00', 
                [STRUCTURE_OBSERVER]: '#000000', 
                [STRUCTURE_FACTORY]: '#007f7f', 
                [STRUCTURE_TERMINAL]: '#7f007f', 
                [STRUCTURE_NUKER]: '#ff0000'
            };

            let structures = [
                [STRUCTURE_SPAWN, 1], 
                [STRUCTURE_STORAGE, 1], 
                [STRUCTURE_LINK, 1], 
                [STRUCTURE_SPAWN, 2], 
                [STRUCTURE_POWER_SPAWN, 1], 
                [STRUCTURE_TOWER, 3], 
                [STRUCTURE_TERMINAL, 1], 
                [STRUCTURE_FACTORY, 1], 
                [STRUCTURE_TOWER, 3], 
                [STRUCTURE_OBSERVER, 1], 
                [STRUCTURE_NUKER, 1], 
                [STRUCTURE_EXTENSION, 60]
            ]; 
            let structureIndex = 0; 
            let structureCount = 0; 
            let cx = center.pos.x; 
            let cy = center.pos.y; 
            let found; 

            function placeStructure(x, y) {
                let open = terrain.get(x, y) !== TERRAIN_MASK_WALL && cost.get(x, y) < 255; 
                let found = open && valid(Math.abs(cx-x), Math.abs(cy-y)); 

                if (found) {
                    vis.circle(x, y, {
                        opacity: 1, 
                        radius: 0.5, 
                        fill: color[structures[structureIndex][0]] 
                    });
                    cost.set(x, y, 255); 
                    let index = STRUCTURE_TO_INDEX[structures[structureIndex][0]]; 
                    layout.structures.push(`${x},${y},${index}`); 

                    structureCount++; 
                    if (structureCount >= structures[structureIndex][1]) {
                        structureIndex++; 
                        structureCount = 0; 
                        if (structureIndex >= structures.length) {
                            return true; 
                        }
                    }
                }
                else if (open) {
                    vis.circle(x, y, {
                        opacity: 0.25, 
                        radius: 0.5, 
                        fill: color[STRUCTURE_ROAD] 
                    });
                    cost.set(x, y, ROAD_COST); 
                    layout.structures.push(`${x},${y},${STRUCTURE_TO_INDEX[STRUCTURE_ROAD]}`); 
                }

                return false; 
            }

            function posToString(pos) {
                return `${pos.x},${pos.y}`; 
            }

            // BFS place items 
            {
                let dx = [-1, 1, 0, 0]; 
                let dy = [0, 0, -1, 1]; 
                let start = { x: cx, y: cy };
                let used = { [posToString(start)]: true }; 
                let queue = new Queue(); 
                queue.enqueue(start); 

                let done = false; 
                let left = Infinity; 
                while (queue.length > 0) {
                    let pos = queue.dequeue(); 

                    if (done) {
                        // vis.circle(pos.x, pos.y, {
                        //     opacity: 1, 
                        //     radius: 0.5, 
                        //     fill: '#ff00ff'
                        // });
                        // left--; 
                        break; 
                    }
                    else {
                        if (placeStructure(pos.x, pos.y)) {
                            done = true; 
                            left = queue.length; 
                        }
                    }

                    if (left > 0) {
                        for (let i = 0; i < 4; i++) {
                            let p = {
                                x: pos.x + dx[i], 
                                y: pos.y + dy[i] 
                            }
                            if (p.x >= 3 && p.x < 47 && p.y >= 3 && p.y < 47 && terrain.get(p.x, p.y) !== TERRAIN_MASK_WALL) {
                                let name = posToString(p); 
                                if (!used[name]) {
                                    used[name] = true; 
                                    queue.enqueue(p); 
                                }
                            }
                        }
                    }
                }
            }

            for (let y = 2; y < 48; y++) {
                for (let x = 2; x < 48; x++) {
                    if (cost.get(x, y) > 0) {
                        let border = false; 
                        borderLoop: 
                        for (let yy = y-1; yy <= y+1; yy++) {
                            for (let xx = x-1; xx <= x+1; xx++) {
                                if (terrain.get(xx, yy) !== TERRAIN_MASK_WALL && cost.get(xx, yy) === 0) {
                                    border = true; 
                                    break; borderLoop; 
                                }
                            }
                        }

                        if (border) {
                            // vis.circle(x, y, {
                            //     opacity: 1, 
                            //     radius: 0.25, 
                            //     fill: '#ff00ff'
                            // });
                        }
                    }
                }
            }
            
            for (let source of room.find(FIND_SOURCES)) {
                this.pathTo(center, source, 1, cost, opts, layout, vis); 
            }
    
            for (let mineral of room.find(FIND_MINERALS)) {
                this.pathTo(center, mineral, 1, cost, opts, layout, vis); 
            }
    
            for (let source of room.find(FIND_SOURCES)) {
                this.pathTo(source, room.controller, 3, cost, opts, layout, vis); 
            }

            room.memory.layout = layout; 
        }
    }

    pathTo(from, to, range, cost, opts, layout, vis) {
        let res = PathFinder.search(from.pos, { pos: to.pos, range: range }, opts); 
        let path = res.path; 
        for (let pos of path) {
            cost.set(pos.x, pos.y, ROAD_COST); 
            vis.circle(pos.x, pos.y, {
                radius: 0.5, 
                opacity: 0.25
            }); 
            layout.structures.push(`${pos.x},${pos.y},${STRUCTURE_TO_INDEX[STRUCTURE_ROAD]}`); 
        }
    }

}

module.exports = StructureDirective; 