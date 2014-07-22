module.exports = function(grunt) {
    'use strict';

    var js_src = [
        '../src/*/*.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // herlock
        requirejs: {
            compile: {
                options: {
                    out: "../built/herlock.js",
                    baseUrl: "../",
                    name : './grunt/compile_config',  // mainで読み込むjsのpath
                    mainConfigFile: './compile_config.js',
                    namespace: "herlock"
                }
            }
        },
        uglify: {
            options: {
                compress: {
                    global_defs: {
                        "DEBUG": false
                    },
                    dead_code: true
                }
            },
            dist: {
                files: {
                    '../built/herlock_cmp.js': ['../built/herlock.js']
                }
            }
        },
        concat: {
            options: {},
            dist: {
                src: [ './require.js', '../built/herlock.js' ],
                dest: '../built/herlock.js'
            }
        }

//        watch: {
//            files: js_src,
//            tasks: 'build'
//        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-closurecompiler');

    grunt.registerTask('default', [ 'requirejs', 'uglify', 'concat' ]);

};