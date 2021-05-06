'use strict' 

class Node {

    constructor(item) {
        this.item = item; 
        this.next = null; 
    }

}

class Queue {

    constructor() {
        this.head = null; 
        this.tail = null; 
        this._length = 0; 
    }

    get length() {
        return this._length; 
    }

    enqueue(item) {
        let node = new Node(item); 
        
        if (this._length === 0) {
            this.head = node; 
            this.tail = node; 
        }
        else {
            this.tail.next = node; 
            this.tail = node; 
        }

        this._length++; 
    }

    dequeue() {
        if (this._length <= 0) {
            throw new Error("Queue does not have any items"); 
        }

        let item = this.head.item; 
        this.head = this.head.next; 
        this._length--; 

        if (this._length === 0) {
            this.tail = null; 
        }

        return item; 
    }

}

module.exports = Queue; 