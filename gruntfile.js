/**
 * Created by zuzanin on 11/6/14.
 */
'use strict';

module.exports = function(grunt) {

    var LIVERELOAD_PORT = 35729;

    // Load necessary grunt plugins
    require('load-grunt-tasks')(grunt);

    //Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //connect webserver with livereload support
        connect: {
            server: {
                options: {
                    hostname: '*',
                    livereload: LIVERELOAD_PORT,
                    open: 'http:localhost:8000/home.html',
                    base: 'dist'
                }
            }
        },

        watch: {

        }
    });

    grunt.registerTask('serve', ['connect:server', 'watch']);
}