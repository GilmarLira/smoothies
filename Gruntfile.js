module.exports = function(grunt) {

  // 1. All configuration goes here
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
        dist: {
            src: 'build/js/scripts/*.js',
            dest: 'build/js/script.js'
        },
  			push: {
            src: 'build/js/script.js',
    				dest: 'www/js/script.js',
  			}
    },
    // uglify: {
    //   my_target: {
    //     files: {
    //       'www/js/script.min.js': 'build/js/interactions.js'
    //     }
    //   }
    // },

    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'www/css/style.css': 'build/scss/style.scss'
        }
      }
    },

    watch: {
      frontend: {
        options: {
          livereload: true,
        },
        files: [
          'www/css/*.css',
          'www/js/*.js',
          'www/index.html'
        ]
      },

      sass: {
        options: {
          livereload: false
        },
        files: [
          'build/scss/globals/*.scss',
          'build/scss/partials/*.scss',
        ],
        tasks: 'sass'
      },

      js: {
        options: {
          livereload: false
        },
        files: [
          'build/js/scripts/*.js'
        ],
        tasks: 'concat'
      }
    }
  });


  // 2. Where we tell Grunt we plan to use these plug-ins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');


  // 3. Where we tell Grunt what to do when we type "grunt" into the terminal.
  grunt.registerTask('default', ['sass', 'concat', 'watch']);

};
