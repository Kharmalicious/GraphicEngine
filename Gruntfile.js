
module.exports = function(grunt) {

    /****************************************
     *
     * PROJECT CONFIGURATION
     *
     ****************************************/

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        opt: {
            header: '/*! GraphicEngine Package - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */',
            footer: '',
            nl: grunt.util.linefeed
        },

        /********************
         * CONCAT FILES
         ********************/
        concat: {
            options: {
                //separator: grunt.util.linefeed+';'+grunt.util.linefeed
            },

            ge_package: {
                src: [
                    'src/core/ObjectModel.js',
                    'src/core/Point.js',

                    'src/utils/Animator.js',
                    'src/utils/Draw.js',

                    'src/display/DisplayObject.js',
                    'src/display/Bitmap.js',
                    'src/display/Text.js',
                    'src/display/Shape.js',

                    'src/display/DisplayObjectContainer.js',
                    'src/display/Stage.js',
                    'src/display/Sprite.js'
                ],
                dest: 'target/temp/ge_package.js'
            },

            main: {
                options: {
                    banner: '<%= opt.fibos_header %><%= brandMsg %><%= opt.nl %>'+
                    'var GraphicEngine = (function(){' + '<%= opt.nl %>'+
                    'var geVersion = "v<%= pkg.version %>";' + '<%= opt.nl %>',
                    footer: '<%= opt.nl %>'+
                    'return GraphicEngine;}());'
                },
                src: [
                    'target/temp/ge_package.js',
                    'target/GEPackage.js',
                    'src/GraphicEngine.js'
                ],
                dest: 'target/<%= pkg.name %>-<%= pkg.version %>.js'
            }

        },

        /********************
         * MINIFY FILES
         ********************/
        uglify: {

            main: {
                options: { banner: '<%= opt.header %><%= opt.nl %>' },
                files: {'target/<%= pkg.name %>-<%= pkg.version %>.min.js': ['target/<%= pkg.name %>-<%= pkg.version %>.js']}
            }

        },

        /********************
         * CLEAN
         ********************/
        clean: {

            target : ['target'],
            build  : ['build'],
            deploy : ['public/<%= pkg.version %>'],
            all    : ['target','build','public/<%= pkg.version %>']

        },

        /********************
         * COPY
         ********************/
        copy: {

            main: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        filter: 'isFile',
                        src: ['target/<%= pkg.name %>*'],
                        dest: 'build/<%= pkg.version %>/'
                    }
                ]
            },

            deploy: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        filter: 'isFile',
                        src: ['build/<%= pkg.version %>/<%= pkg.name %>-<%= pkg.version %>.min.js'],
                        dest: 'public/<%= pkg.version %>/'
                    }
                ]
            }

        }

    });

    /****************************************
     *
     * LOAD PLUGINS
     *
     ****************************************/

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    /****************************************
     *
     * REGISTER TASKS
     *
     ****************************************/

    // Private methods
    function filesList(path,base){
        base || (base=path);

        var className,packageName,
            fs = require('fs'),
            files = fs.readdirSync(path),
            ret = {
                packages: [],
                rows: []
            };

        files.forEach(function(v){
            var s = fs.statSync(path+v);
            if(s.isFile()){
                className = v.replace('.js','');
                packageName = path.replace(base,'').replace('/','');
                path!=base && ret.packages.push(className);
                path!=base && ret.rows.push('gep["'+packageName+'"]["'+className+'"]='+className+';');
            }
            else if(s.isDirectory()){
                ret.packages = ret.packages.concat(filesList(path+v+'/',base).packages);
                ret.rows = ret.rows.concat(filesList(path+v+'/',base).rows);
            }
        });

        return ret;
    }

    // --- METHOD tasks --- //

    // Full GraphicEngine packages
    grunt.registerTask('create_package','',function(){
        var ln = grunt.util.linefeed,
            fl = filesList('src/'),
            rows = fl.rows.join(ln),
            packages = fl.packages.join(','),
            output = [];

        output.push('var GEPackage = (function('+packages+'){');
        output.push('var gep={};');
        output.push(rows);
        output.push('return gep;');
        output.push('}('+packages+'));');

        grunt.file.write('target/GEPackage.js', output.join(ln));
    });

    // --- ALIAS tasks --- //

    // Full tasks
    grunt.registerTask('build', ['clean:target', 'create_package', 'concat:ge_package', 'concat:main', 'uglify:main', 'copy:main', 'clean:target']);
    grunt.registerTask('deploy', ['clean:deploy', 'build', 'copy:deploy']);

    // Default task
    grunt.registerTask('default', ['build']);

};
