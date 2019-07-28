const path = require('path'); 

module.exports = function(grunt) {

    const config = require('./config.json'); 
    const webpackConfig = require('./webpack.config'); 
    const src = 'src/'; 
    const dest = 'build/'; 
    webpackConfig.output.path = path.resolve(__dirname, dest); 

    const processFile = function(content, srcPath) {
        const prefix = (path.dirname(srcPath) + '/').substring(src.length);
        return content.replace(/require\s*\(\s*['"](.*)['"]\s*\)/g, (found) => {
            let requirePath = /['"](.*)['"]/.exec(found)[1]; 
            return "require('" + path.normalize(prefix + requirePath).replace(/[\\/]/g, '.') + "')"; 
        });
    }

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
                src: [dest + '*.js'] 
            }
        }, 

        clean: {
            dist: [dest + '**/*.*'], 
        }, 

        copy: {
            screeps: {
                expand: true, 
                cwd: src, 
                src: '**', 
                dest: dest, 
                filter: 'isFile', 
                rename: (dest, src) => dest + src.replace(/\//g, '.'),
                options: {
                    process: processFile
                }
            }, 
            stable: {
                files: [{
                    expand: true, 
                    cwd: dest, 
                    src: '**.js', 
                    dest: 'stableBuild/', 
                    filter: 'isFile'
                }]
            }, 
            sim: {
                files: [{
                    expand: true, 
                    cwd: dest, 
                    src: '**.js', 
                    dest: config.sim.dest, 
                    filter: 'isFile'
                }]
            }
        }, 

        webpack: {
            dist: webpackConfig 
        }
    });

    grunt.registerTask('build', ['clean', 'copy:screeps']); 
    grunt.registerTask('build-min', ['clean', 'webpack:dist']); 
    grunt.registerTask('stable',  ['clean', 'webpack:dist', 'copy:stable']);
    grunt.registerTask('private',  ['screeps']);
    grunt.registerTask('sim',  ['copy:sim']);

}