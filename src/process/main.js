'use strict' 

class Main extends kernel.Process {

    get description() {
        return 'Main process'; 
    }

    get priority() {
        return PRIORITY_HIGHEST; 
    }

    create(args) {
        for (let i = 0; i < 10; i++) {
            // this.startProcess('./test'); 
        }
    }

    reload() {
        this.data.value = 0; 
    }

    run() {
        // console.log('main run'); 
        // if (Math.random() < 0.5) {
            this.startProcess('./test'); 
        // }

        for (let i = 0; i < 100000; i++) {
            this.data.value++; 
        }

        // this.exit(); 
    }

}

module.exports = Main; 
