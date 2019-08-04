'use strict'

const sort = require('./sort');

const mapper = {
    trivial: 4, 
    low: 3, 
    medium: 2, 
    high: 1, 
    critical: 0 
}; 

const priority = {
    TRIVIAL: 'trivial',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',

    compare: function (a, b) {
        return mapper[b.priority] - mapper[a.priority];
    },

    sort: function (array) {
        return sort.countSort(array, this.MIN_PRIORITY, this.MAX_PRIORITY, x => mapper[x.priority]);
    }, 

    MIN_PRIORITY: 0,
    MAX_PRIORITY: 4
};

module.exports = priority; 