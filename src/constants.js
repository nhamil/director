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
const STATUS_SUSPEND = 3; 
const STATUS_KILL = 4; 

const STATUS_NAME = {
    [STATUS_NEXIST]: 'nexist', 
    [STATUS_ACTIVE]: 'active', 
    [STATUS_SLEEP]: 'sleep', 
    [STATUS_SUSPEND]: 'suspnd', 
    [STATUS_KILL]: 'kill' 
};

const PID_INVALID = -1; 
const PID_NONE = 0; 
const PID_MIN = 1; 
const PID_MAX = 99999; 

/** 
 * @typedef {import('./os/kernel')} Kernel
 * @type {Kernel} 
 */
const kernel = null; 

global.PRIORITY_LOWEST = 15; 
global.PRIORITY_WALL = 10; 
global.PRIORITY_DEFAULT = 6; 
global.PRIORITY_HIGHEST = 0; 

global.PRIORITY_HIGH = 3; 
global.PRIORITY_MEDIUM = 6; 
global.PRIORITY_LOW = 9; 
global.PRIORITY_BACKGROUND = 14; 

global.STATUS_NEXIST = 0; 
global.STATUS_ACTIVE = 1; 
global.STATUS_SLEEP = 2; 
global.STATUS_SUSPEND = 3; 
global.STATUS_KILL = 4; 

global.STATUS_NAME = {
    [STATUS_NEXIST]: 'nexist', 
    [STATUS_ACTIVE]: 'active', 
    [STATUS_SLEEP]: 'sleep', 
    [STATUS_SUSPEND]: 'suspnd', 
    [STATUS_KILL]: 'kill' 
};

global.PID_INVALID = -1; 
global.PID_NONE = 0; 
global.PID_MIN = 1; 
global.PID_MAX = 99999; 

/** 
 * @typedef {import('./os/kernel')} Kernel
 * @type {Kernel} 
 */
global.kernel = null; 