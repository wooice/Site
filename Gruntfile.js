'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.config.init({
        buildEnv : grunt.option('buildEnv') || 'prod',
        buildNumber : grunt.option('buildNumber') || '0',
        pkg: grunt.file.readJSON('package.json'),
        config: grunt.file.readJSON('grunt.json'),
        changelog: {
            options: {
                dest: 'CHANGELOG.md',
                prepend: true
            }
        },
        clean: {
            build: ['dist/', 'tmp/'],
            tmp: ['tmp/']
        },
        concat: {
            app: {
                src: [
                    'tmp/js/templates.js',
                    "app/js/**/*.js"
                ],
                dest: 'tmp/js/scripts.js'
            },
            js: '<%= config.concat.js %>',
            css: '<%= config.concat.css %>'
        },
        copy: {
            tmp: {
                files: [
                    {
                        expand: true,
                        cwd: 'app/',
                        src: ['**'],
                        dest: 'tmp/'
                    }
                ]
            },
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'tmp/',
                        src: ['index.html', 'js/scripts.min.js', 'img/**', 'css/styles.min.css', 'lib/font-awesome/font/**', 'lib/soundmanager/swf/soundmanager2_debug.swf'],
                        dest: 'dist/',
                        rename: function(desc, src){
                            return desc + src.replace('min.', 'min.<%= buildNumber %>.')
                        }
                    },
                    {
                        expand: true,
                        cwd: 'tmp/',
                        src: ['config.<%= buildEnv %>.json'],
                        dest: 'dist/',
                        rename: function(dest,src){
                            return dest + 'config.json';
                        }
                    }
                ]
            }
        },
        html2js: {
            options: {
                base: 'app/'
            },
            partials: {
                src: ['app/partials/**/*.html'],
                dest: 'tmp/js/templates.js',
                module: 'templates'
            }
        },
        htmlrefs: {
            dist: {
                src: 'tmp/index.html',
                dest: 'tmp/'
            },
            options: {
                buildNumber: '<%= buildNumber %>'
            }
        },
        jshint: {
            files: ['app/js/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        'regex-replace': {
            strict: {
                src: ['tmp/js/scripts.js'],
                actions: [
                    {
                        name: 'use strict',
                        search: '\\\'use strict\\\';',
                        replace: '',
                        flags: 'gmi'
                    }
                ]
            },
            templates: {
                src: ['tmp/js/scripts.js'],
                actions: [
                    {
                        name: 'templates',
                        search: /wooice\',\s\[/,
                        replace: 'wooice\', [\'templates\',',
                        flags: 'gmi'
                    }
                ]
            }
        },
        uglify: {
            app: {
                options: {
                    mangle: false
                },
                files: {
                    'tmp/js/scripts.min.js': 'tmp/js/scripts.min.js'
                }
            }
        }
    });

    // Additional task plugins
    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-htmlrefs');
    grunt.loadNpmTasks('grunt-regex-replace');

    grunt.registerTask('build', [
        'clean:build',
        'copy:tmp',
        'html2js',
        'concat:app',
        'regex-replace:strict',
        'regex-replace:templates',
        'concat:js',
        'concat:css',
        'uglify',
        'htmlrefs',
        'copy:build',
        'clean:tmp',
        'changelog'
    ]);
};
