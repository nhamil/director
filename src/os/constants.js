'use strict' 

const PRIORITY_LOWEST = 15; 
const PRIORITY_WALL = 10; 
const PRIORITY_DEFAULT = 6; 
const PRIORITY_HIGHEST = 0; 

const STATUS_NOT_EXIST = 0; 
const STATUS_ACTIVE = 1; 
const STATUS_SLEEP = 2; 
const STATUS_KILL = 3; 

const STATUS_NAME = {
    [STATUS_NOT_EXIST]: 'nexist', 
    [STATUS_ACTIVE]: 'active', 
    [STATUS_SLEEP]: 'sleep', 
    [STATUS_KILL]: 'kill' 
};

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