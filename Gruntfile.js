module.exports = function ( grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    jasmine_node : {
      matchall        : true,
      useCoffee       : true,
      extensions      : [ 'coffee']
    },
    jshint: {
      options: {
        smarttabs:true,
        curly: true,
        eqeqeq: false,
        immed: false,
        latedef: true,
        newcap: false,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        expr : true,
        multistr:true,
        debug   : true,
        nonew   : true,
        evil : true, /* otherwise document.write is prohibited */
        globals: {
          require : true,
          module  : true,
            // this is for jasmine tests to be "lintable"
          describe : true,
          it       : true,
          expect   : true
        }
      },
      all: [ 'Gruntfile.js', '*.js']
    },
    watch: {
      options: {
        livereload: 9091,
      },
      files: [ 'orangevolt-macrop.js', 'spec/**.*'],
      tasks: [ 'jshint']
    },
    connect : {
      server : {
        options : {
          port : 9090,
          livereload  : 9091
        }
      }
    },
    open : {
      all : {
        path : "http://localhost:9090/spec/index.html"
      }
    }
  });
/*
grunt.event.on('watch', function(action, filepath, target) {
  grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
});
*/
  //grunt.loadTasks('tasks');
  grunt.loadNpmTasks( 'grunt-contrib');
  grunt.loadNpmTasks( 'grunt-jasmine-node');
  grunt.loadNpmTasks( 'grunt-open');


  grunt.registerTask( 'dev', ['connect', 'open', 'watch']);
  grunt.registerTask( 'test', [ 'jasmine_node']);
  grunt.registerTask( 'default', ['jshint', 'test'/*, 'concat'*/]);
};