'use strict' 

const TASK_WITHDRAW = 'withdraw'; 
const TASK_MINE = 'mine'; 
const TASK_UPGRADE = 'upgrade'; 
const TASK_BUILD = 'build'; 
const TASK_REPAIR = 'repair'; 
const TASK_SUPPLY = 'supply'; 

/* END CONSTANTS */

// I hate this but it makes vscode recognize global constants 
for (let match of module.code.substring(module.code.indexOf("'use strict'"), module.code.indexOf('/* END CONSTANTS */')).match(/\nconst\s+(\w+)/g)) {
    eval(match.replace(/\nconst\s+(\w+)/g, 'global.$1 = $1')); 
} 