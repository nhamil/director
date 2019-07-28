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
            return "require('./" + path.normalize(prefix + requirePath).replace(/[\\/]/g, '.') + "')"; 
        });
    }

    let uploadConfig = {}; 
    let copyConfig = {}; 

    let build = ['clean', 'copy:screeps']; 
    let buildMin = ['clean', 'webpack:dist']; 

    let local = grunt.option('local'); 
    if (local) {
        build.push('copy:local'); 
        copyConfig = config[local]; 
    }

    let upload = grunt.option('upload'); 
    if (upload) {
        build.push('screeps'); 
        uploadConfig = config[upload]; 
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
                    host: uploadConfig.host, 
                    port: uploadConfig.port, 
                    http: uploadConfig.http 
                }, 
                email: uploadConfig.email, 
                password: uploadConfig.password, 
                branch: uploadConfig.branch || 'default', 
                ptr: uploadConfig.ptr || false
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
                src: '**/*.js', 
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
                    src: '*.js', 
                    dest: 'stableBuild/', 
                    filter: 'isFile'
                }]
            }, 
            local: {
                files: [{
                    expand: true, 
                    cwd: dest, 
                    src: '*.js', 
                    dest: copyConfig.dest, 
                    filter: 'isFile'
                }]
            }
        }, 

        webpack: {
            dist: webpackConfig 
        }
    });

    grunt.registerTask('default', build); 
    grunt.registerTask('build', build); 
    grunt.registerTask('build-min', buildMin); 
    grunt.registerTask('stable',  ['clean', 'webpack:dist', 'copy:stable']);

}