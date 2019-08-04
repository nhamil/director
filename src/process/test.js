'use strict' 

class Test extends kernel.Process {

    create(args) {
        console.log('test: create'); 

        this.data.time = Game.time + 10; 
    }

    reload() {
        this.data.value = 0; 
    }

    run() {
        // this.startProcess('./test'); 

        // if (Math.random() < 0.5) this.sleep(); 
        
        for (let i = 0; i < 1000000; i++) {
            this.data.value++; 
        }

        if (parseInt(this.data.time) < Game.time) this.exit(); 

        // this.sleep(2); 

        // if (Math.random() < 0.5) this.exit(); 
    }

}

module.exports = Test; 
