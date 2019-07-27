const path = require('path'); 

module.exports = function(grunt) {

    const config = require('./config.json'); 

    grunt.loadNpmTasks('grunt-screeps'); 
    grunt.loadNpmTasks('grunt-contrib-clean'); 
    grunt.loadNpmTasks('grunt-contrib-copy'); 
    grunt.loadNpmTasks('grunt-webpack'); 
    grunt.loadNpmTasks('grunt-rsync'); 

    grunt.initConfig({
        screeps: {
            options: {
                server: {
                    host: config.private.host, 
                    port: config.private.port, 
                    http: config.private.http 
                }, 
                email: config.private.email, 
                password: config.private.password, 
                branch: config.private.branch || 'default', 
                ptr: false 
            }, 
            dist: {
                src: ['dist/*.js'] 
            }
        }, 

        clean: {
            'dist': ['dist'], 
        }, 

        copy: {
            screeps: {
                files: [{
                    expand: true, 
                    cwd: 'src/', 
                    src: '**', 
                    dest: 'dist/', 
                    filter: 'isFile', 
                    rename: (dest, src) => dest + src.replace(/\//g, '.') 
                }]
            }, 
            stable: {
                files: [{
                    expand: true, 
                    cwd: 'dist/', 
                    src: '**.js', 
                    dest: 'stable/', 
                    filter: 'isFile'
                }]
            }, 
            sim: {
                files: [{
                    expand: true, 
                    cwd: 'dist/', 
                    src: '**.js', 
                    dest: config.sim.dest, 
                    filter: 'isFile'
                }]
            }
        }, 

        webpack: {
            dist: require('./webpack.config') 
        }
    });

    grunt.registerTask('stable',  ['clean', 'webpack:dist', 'copy:stable']);
    grunt.registerTask('private',  ['clean', 'webpack:dist', 'screeps']);
    grunt.registerTask('sim',  ['clean', 'webpack:dist', 'copy:sim']);

}