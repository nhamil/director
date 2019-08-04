'use strict' 

class Test extends kernel.Process {

    get description() {
        return 'testing'; 
    }

    create(args) {
        this.data.time = 10; 
    }

    reload() {
        this.data.value = 0; 
    }

    run() {
        for (let i = 0; i < 10000; i++) {
            this.data.value++; 
        }

        this.data.time--; 

        if (this.data.time <= 0) {
            this.exit(); 
        }
        else if (Math.random() < 0.1) {
            // this.sleep(10); 
        }
    }

}

module.exports = Test; 
