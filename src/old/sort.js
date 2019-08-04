'use strict' 

const identity = (x) => x; 

const defaultCompare = (a, b) => a - b; 

/**
 * @param {Array} array 
 * @param {number} min 
 * @param {number} max 
 * @param {(elem) => number} mapper 
 */
function countSort(array, min, max, mapper = identity) {
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
 * @param {Array<E>} array 
 * @param {(a, b) => number} compare 
 */
function quicksort(array, compare = defaultCompare) {
    return quicksortRange(array, 0, array.length - 1, compare); 
}

/**
 * @param {Array} array 
 * @param {number} left 
 * @param {number} right 
 * @param {(a, b) => number} compare 
 */
function quicksortRange(array, left, right, compare = defaultCompare) {
    if (left < right) {
        const index = partition(array, left, right, compare); 
        quicksortRange(array, left, index - 1, compare); 
        quicksortRange(array, index + 1, right, compare); 
    }
    return array; 
}

/**
 * @param {Array} array 
 * @param {number} left 
 * @param {number} right 
 * @param {(a, b) => number} compare
 */
function partition(array, left, right, compare) {
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
function swap(array, a, b) {
    let tmp = array[a]; 
    array[a] = array[b]; 
    array[b] = tmp; 
}

module.exports = {
    countSort, 
    quicksort 
};