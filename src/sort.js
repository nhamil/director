const sort = module.exports; 

/**
 * @param {Array} array 
 * @param {(elem) => number} mapper 
 * @param {number} min 
 * @param {number} max 
 */
sort.countSort = function(array, mapper, min, max) {
    let tmp = {}; 

    for (let i = min; i <= max; i++) {
        tmp[i] = []; 
    }

    for (let i = 0; i < array.length; i++) {
        tmp[mapper(array[i])].push(array[i]); 
    }
    
    // clear the array 
    array.length = 0; 

    for (let i = min; i <= max; i++) {
        let a = tmp[i]; 
        for (let j = 0; j < a.length; j++) {
            array.push(a[j]); 
        }
    }

    return array; 
}

/**
 * @param {Array} array 
 * @param {function} compare 
 */
sort.quicksort = function(array, compare) {
    return sort.quicksortRange(array, 0, array.length - 1, compare); 
}

/**
 * @param {Array} array 
 * @param {number} left 
 * @param {number} right 
 * @param {function} compare 
 */
sort.quicksortRange = function(array, left, right, compare) {
    if (left < right) {
        const index = sort.partition(array, left, right, compare); 
        sort.quicksortRange(array, left, index - 1, compare); 
        sort.quicksortRange(array, index + 1, right, compare); 
    }
    return array; 
}

/**
 * @param {Array} array 
 * @param {number} left 
 * @param {number} right 
 * @param {(a, b) => number} compare
 */
sort.partition = function(array, left, right, compare) {
    const pivot = array[right]; 
    let i = left - 1; 

    for (let j = left; j < right; j++) {
        if (compare(array[j], pivot) < 0) {
            i++; 
            swap(array, i, j); 
        }
    }

    swap(array, i + 1, right); 
    return i + 1; 
}

/**
 * @param {Array} array 
 * @param {number} a 
 * @param {number} b 
 */
sort.swap = function(array, a, b) {
    let tmp = array[a]; 
    array[a] = array[b]; 
    array[b] = tmp; 
}