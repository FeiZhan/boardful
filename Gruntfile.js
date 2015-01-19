module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      engine: {
	        src: ['src/<%= pkg.name %>.js', 'src/engine/*.js'],
	        dest: 'build/<%= pkg.name %>.engine.js'
      },
      browser: {
	        src: ['build/<%= pkg.name %>.engine.js', 'src/browser/*.js'],
	        dest: 'build/<%= pkg.name %>.browser.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> browser <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/<%= pkg.name %>.browser.js',
        dest: 'build/<%= pkg.name %>.browser.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['concat', 'uglify']);

};
