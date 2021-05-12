'use strict' 

module.exports = {
    'init': require('../processes/init'), 
    'colony': require('../processes/colony'), 
    'roomeval': require('../processes/roomeval'), 

    'directive.haul': require('../processes/directive/haul'), 
    'directive.mine': require('../processes/directive/mine'), 
    'directive.startup': require('../processes/directive/startup'), 
    'directive.structure': require('../processes/directive/structure'), 
    'directive.spawn': require('../processes/directive/spawn'), 

    'task.build': require('../processes/task/build'), 
    'task.haul': require('../processes/task/haul'), 
    'task.mine': require('../processes/task/mine'), 
    'task.repair': require('../processes/task/repair'), 
    'task.upgrade': require('../processes/task/upgrade'), 
    'task.withdraw': require('../processes/task/withdraw')
}; 