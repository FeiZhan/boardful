module.exports = function(grunt) {

	grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	concat: {
		engine: {
			src: ['src/engine/*.js'],
			dest: 'build/<%= pkg.name %>.engine.js'
		},
		desktop: {
			src: ['src/engine/*.js', 'src/desktop/*.js', 'mods/*.js', 'mods/*/*.js'],
			dest: 'build/<%= pkg.name %>.desktop.js'
		},
		browser: {
			src: ['src/engine/*.js', 'src/browser/*.js'],
			dest: 'build/<%= pkg.name %>.browser.js'
		},
		server: {
			src: ['src/engine/*.js', 'src/server/*.js'],
			dest: 'build/<%= pkg.name %>.server.js'
		},
		all: {
			src: ['src/*.js', 'src/*/*.js', 'mods/*.js', 'mods/*/*.js'],
			dest: 'build/<%= pkg.name %>.js'
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
