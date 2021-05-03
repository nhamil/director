'use strict' 

module.exports = {
    'init': require('../processes/init'), 
    'colony': require('../processes/colony'), 

    'directive.haul': require('../processes/directive/haul'), 
    'directive.mine': require('../processes/directive/mine'), 
    'directive.startup': require('../processes/directive/startup'), 
    'directive.structure': require('../processes/directive/structure'), 
    'directive.spawn': require('../processes/directive/spawn'), 

    'task.build': require('../processes/task/build'), 
    'task.haul': require('../processes/task/haul'), 
    'task.mine': require('../processes/task/mine'), 
    'task.upgrade': require('../processes/task/upgrade'), 

    'action.build': require('../processes/action/build'), 
    'action.mine': require('../processes/action/mine'), 
    'action.transfer': require('../processes/action/transfer'), 
    'action.upgrade': require('../processes/action/upgrade'), 
    'action.withdraw': require('../processes/action/withdraw')
}; 