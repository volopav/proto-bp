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
        env: grunt.file.readJSON("environment.json"),

        // The directory to which we throw our compiled project files.
        distdir: 'dist',

        /**
         * The banner is the comment that is placed at the top of our compiled
         * source files. It is first processed as a Grunt template, where the `<%=`
         * pairs are evaluated based on this very configuration object.
         */
        meta: {
            banner:
                '/**\n' +
                    ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    ' * <%= pkg.homepage %>\n' +
                    ' *\n' +
                    ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                    ' */\n'
        },

        /**
         * This is a collection of file definitions we use in the configuration of
         * build tasks. `js` is all project javascript, less tests. `atpl` contains
         * our reusable components' template HTML files, while `ctpl` contains the
         * same, but for our app's code. `html` is just our main HTML file and
         * `less` is our main stylesheet.
         */
        src: {
            js: [ 'src/**/*.js', '!src/**/*.spec.js' ],
            atpl: [ 'src/app/**/*.tpl.html' ],
            ctpl: [ 'src/components/**/*.tpl.html' ],
            tpljs: [ '<%= distdir %>/tmp/**/*.js' ],
            html: [ 'src/index.html' ],
            sass: 'src/sass/app.scss',
            unit: [ 'src/**/*.spec.js' ]
        },

        //connect webserver with livereload support
        connect: {
            server: {
                options: {
                    hostname: '*',
                    livereload: LIVERELOAD_PORT,
                    open: 'http://localhost:8000/index.html',
                    base: '<%= distdir %>'
                }
            }
        },

        /**
         * The directory to delete when `grunt clean` is executed.
         */
        clean: [ '<%= distdir %>' ],

        /**
         * `grunt copy` just copies files from A to B. We use it here to copy our
         * project assets (images, fonts, etc.) into our distribution directory.
         */
        copy: {
            assets: {
                files: [
                    {
                        src: [ '**' ],
                        dest: '<%= distdir %>/assets/',
                        cwd: 'src/assets',
                        expand: true
                    }
                ]
            }
        },

        /**
         * `grunt concat` concatenates multiple source files into a single file.
         */
        concat: {
            /**
             * The `dist` target is the concatenation of our application source code
             * into a single file. All files matching what's in the `src.js`
             * configuration property above will be included in the final build.
             *
             * In addition, the source is surrounded in the blocks specified in the
             * `module.prefix` and `module.suffix` files, which are just run blocks
             * to ensure nothing pollutes the global scope.
             *
             * The `options` array allows us to specify some customization for this
             * operation. In this case, we are adding a banner to the top of the file,
             * based on the above definition of `meta.banner`. This is simply a
             * comment with copyright informaiton.
             */
            dist: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                src: [ 'module.prefix', '<%= src.js %>', '<%= src.tpljs %>', 'module.suffix' ],
                dest: '<%= distdir %>/assets/<%= pkg.name %>.js'
            },

            /**
             * The `libs` target is for all third-party libraries we need to include
             * in the final distribution. They will be concatenated into a single
             * `libs.js` file.  One could combine this with the above for a single
             * payload, but then concatenation order will obviously be important to
             * get right.
             */
            libs: {
                src: [
                    'bower_components/modernizr/modernizr.js',
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/angular/angular.js',
                    'bower_components/angular-ui/build/angular-ui.js',
                    'bower_components/angular-foundation/mm-foundation.js'
                ],
                dest: '<%= distdir %>/assets/libs.js'
            }
        },

        compass: {
            dist: {
                options: {
                    sassDir: 'src/sass',
                    cssDir: '<%= distdir %>/assets/styles/',
                    environment: 'production',
                    raw: "preferred_syntax = :scss\n",
                    importPath: [
                        'bower_components/foundation/scss'
                    ]
                }
            },

            dev: {
                options: {
                    outputStyle: 'compact',
                    sassDir: 'src/sass',
                    cssDir: '<%= distdir %>/assets/styles/',
                    environment: 'development',
                    raw: "preferred_syntax = :scss\n",
                    importPath: [
                        'bower_components/foundation/scss'
                    ]
                }
            }
        },

        /**
         * HTML2JS is a Grunt plugin originally written by the AngularUI Booststrap
         * team and updated to Grunt 0.4 by me. It takes all of your template files
         * and places them into JavaScript files as strings that are added to
         * AngularJS's template cache. This means that the templates too become part
         * of the initial payload as one JavaScript file. Neat!
         */
        html2js: {
            /**
             * These are the templates from `src/app`.
             */
            app: {
                src: [ '<%= src.atpl %>' ],
                base: 'src/app',
                dest: 'dist/tmp'
            },

            /**
             * These are the templates from `src/components`.
             */
            component: {
                src: [ '<%= src.ctpl %>' ],
                base: 'src/components',
                dest: 'dist/tmp'
            }
        },

        /**
         * And for rapid development, we have a watch set up that checks to see if
         * any of the files listed below change, and then to execute the listed
         * tasks when they do. This just saves us from having to type "grunt" into
         * the command-line every time we want to see what we're working on; we can
         * instead just leave "grunt watch" running in a background terminal. Set it
         * and forget it, as Ron Popeil used to tell us.
         *
         * But we don't need the same thing to happen for all the files.
         */
        delta: {
            /**
             * By default, we want the Live Reload to work for all tasks; this is
             * overridden in some tasks (like this file) where browser resources are
             * unaffected. It runs by default on port 35729.
             */
            options: {
                livereload: true
            },

            /**
             * When the Gruntfile changes, we just want to lint it. That said, the
             * watch will have to be restarted if it should take advantage of any of
             * the changes.
             */
            gruntfile: {
                files: 'Gruntfile.js',
                options: {
                    livereload: false
                }
            },

            /**
             * When our source files change, we want to run most of our build tasks
             * (excepting uglification).
             */
            src: {
                files: [
                    '<%= src.js %>'
                ],
                tasks: [ 'concat:dist' ]
            },

            /**
             * When assets are changed, copy them. Note that this will *not* copy new
             * files, so this is probably not very useful.
             */
            assets: {
                files: [
                    'src/assets/**/*'
                ],
                tasks: [ 'copy' ]
            },

            /**
             * When index.html changes, we need to compile just it.
             */
            html: {
                files: [ '<%= src.html %>' ],
                tasks: [ 'index' ]
            },

            /**
             * When our templates change, we only add them to the template cache.
             */
            tpls: {
                files: [
                    '<%= src.atpl %>',
                    '<%= src.ctpl %>'
                ],
                tasks: [ 'html2js', 'concat:dist']
            },

            /**
             * When the CSS files change, we need to compile and minify just them.
             */
            sass: {
                files: [ 'src/**/*.scss' ],
                tasks: 'compassCompile'
            },

            envs: {
                files: [
                    'environment.json'
                ],

                tasks: ['build']
            }
        }
    });

    /**
     * In order to make it safe to just compile or copy *only* what was changed,
     * we need to ensure we are starting from a clean, fresh build. So we rename
     * the `watch` task to `delta` (that's why the configuration var above is
     * `delta`) and then add a new task called `watch` that does a clean build
     * before watching for changes.
     */
    grunt.renameTask( 'watch', 'delta' );
    grunt.registerTask( 'watch', [ 'default', 'delta' ] );

    /**
     * The default task is to build.
     */
    grunt.registerTask( 'default', [ 'build', 'connect:server', 'delta' ] );
    grunt.registerTask( 'build', ['clean', 'html2js', 'concat', 'compassCompile', 'index', 'copy'] );


    /**
     *  Task for general compass items
     *  This task will determine which environment you have set and run that task
     */
    grunt.registerTask('compassCompile', 'Compiling the sass files', function () {
        grunt.log.writeln("Current environment: " + grunt.config.get("env").environment);

        if (grunt.config.get("env").environment === "production") {
            grunt.task.run('compass:dist');
        } else {
            grunt.task.run('compass:dev');
        }

    });

    /**
     * A task to build the project, without some of the slower processes. This is
     * used during development and testing and is part of the `watch`.
     */
    grunt.registerTask( 'quick-build', ['clean', 'html2js', 'concat', 'index', 'copy'] );

    /**
     * The index.html template includes the stylesheet and javascript sources
     * based on dynamic names calculated in this Gruntfile. This task compiles it.
     */
    grunt.registerTask( 'index', 'Process index.html template', function () {
        grunt.file.copy('src/index.html', 'dist/index.html', { process: grunt.template.process });
    });
}