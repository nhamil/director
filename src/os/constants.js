'use strict' 

const PRIORITY_LOWEST = 15; 
const PRIORITY_WALL = 10; 
const PRIORITY_DEFAULT = 6; 
const PRIORITY_HIGHEST = 0; 

const PRIORITY_HIGH = 3; 
const PRIORITY_MEDIUM = 6; 
const PRIORITY_LOW = 9; 
const PRIORITY_BACKGROUND = 14; 

const STATUS_NEXIST = 0; 
const STATUS_ACTIVE = 1; 
const STATUS_SLEEP = 2; 
const STATUS_KILL = 3; 

const STATUS_NAME = {
    [STATUS_NEXIST]: 'nexist', 
    [STATUS_ACTIVE]: 'active', 
    [STATUS_SLEEP]: 'sleep', 
    [STATUS_KILL]: 'kill' 
};

const PID_INVALID = -1; 
const PID_NONE = 0; 
const PID_MIN = 1; 
const PID_MAX = 9999; 

/**
 * @typedef {import('./kernel')} Kernel 
 * @typedef {import('./process')} Process 
 * 
 * @type {Kernel} 
 */
const kernel = null; 

/* END CONSTANTS */

// I hate this but it makes vscode recognize global constants 
for (let match of module.code.substring(module.code.indexOf("'use strict'"), module.code.indexOf('/* END CONSTANTS */')).match(/\nconst\s+(\w+)/g)) {
    eval(match.replace(/\nconst\s+(\w+)/g, 'global.$1 = $1')); 
} 