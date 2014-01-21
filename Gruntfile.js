module.exports = function(grunt) {

    var sources = [
        'src/load.js',
        'src/lib.js',
        'src/plugin.js'
    ];

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        clean : [ 'build/*.*' ],
        jshint : {
            sources : sources
        },
        concat : {
            dist : {
                src : sources,
                dest : 'build/analysjs.js'
            }
        },
        uglify : {
            dist : {
                options : {
                    sourceMap : 'build/analysjs.js.map',
                    sourceMappingURL : 'https://raw.github.com/vendji/analysjs/master/build/analysjs.js.map'
                },
                src : 'build/analysjs.js',
                dest : 'build/analysjs.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //grunt.registerTask('test', ['jshint', 'jasmine']);
    grunt.registerTask('default', ['clean', 'jshint', 'concat', 'uglify']);

};
