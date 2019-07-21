'use strict';

const sass = require('node-sass');

function getEnvironment(grunt) {
   const TYPES = [ 'prd', 'dev' ],
         env = grunt.option('env');

   return TYPES.indexOf(env) === -1 ? 'dev' : env;
}

module.exports = (grunt) => {
   const ENVIRONMENT = getEnvironment(grunt);

   let config;

   config = {
      entryFile: './src/ts/index.ts',
      js: {
         gruntFile: 'Gruntfile.js',
         webpackConfig: 'webpack.config.js',
         all: [
            './*.js',
            './src/**/*.js',
            './tests/**/*.js',
         ],
      },
      ts: {
         src: './src/**/*.ts',
         all: [
            './*.ts',
            './src/**/*.ts',
            './tests/**/*.ts',
         ],
         configs: {
            standards: 'tsconfig.json',
            esm: 'src/tsconfig.esm.json',
         },
      },
      scss: {
         src: './src/scss/**/*.scss',
         main: './src/scss/substratum.scss',
      },
      commands: {
         tsc: './node_modules/.bin/tsc',
         webpack: './node_modules/.bin/webpack',
      },
      out: {
         js: './static/js',
         css: {
            base: './static/css/',
            main: './static/css/substratum.css',
         },
         test: [ './.nyc_output', 'coverage' ],
      },
   };

   grunt.initConfig({

      pkg: grunt.file.readJSON('package.json'),

      eslint: {
         target: [ ...config.js.all, ...config.ts.all ],
         fix: {
            src: [ ...config.js.all, ...config.ts.all ],
            options: {
               fix: true,
            },
         },
      },

      sasslint: {
         options: {
            configFile: 'node_modules/sass-lint-config-silvermine/sass-lint.yml',
         },
         target: config.scss.src,
      },

      exec: {
         options: {
            failOnError: true,
         },
         standards: {
            cmd: `${config.commands.tsc} -p ${config.ts.configs.standards} --pretty`,
         },
         esm: {
            cmd: `${config.commands.tsc} -p ${config.ts.configs.esm} --pretty`,
         },
         webpackUMD: {
            cmd: `${config.commands.webpack} ${config.entryFile} ${ENVIRONMENT === 'prd' ? '--env.production' : ''}`,
         },
      },

      sass: {
         options: {
            sourceMap: ENVIRONMENT === 'dev',
            sourceMapContents: ENVIRONMENT === 'dev',
            indentWidth: 3,
            outputStyle: (ENVIRONMENT === 'dev' ? 'expanded' : 'compressed'),
            sourceComments: ENVIRONMENT === 'dev',
            implementation: sass,
         },

         build: {
            files: { [config.out.css.main]: config.scss.main },
         },
      },

      copy: {
         thirdparty: {
            files: [
               {
                  expand: true,
                  cwd: 'node_modules/tachyons/css',
                  src: 'tachyons.min.css',
                  dest: config.out.css.base,
               },
            ],
         },
      },

      clean: {
         dist: [ config.out.js, config.out.css.base ],
         testOutput: config.out.test,
      },

      watch: {
         ts: {
            files: [ config.ts.src ],
            tasks: [ 'build-umd' ],
         },
         scss: {
            files: [ config.ts.scss ],
            tasks: [ 'sass:build' ],
         },
         webpackConfig: {
            files: [ config.js.webpackConfig ],
            tasks: [ 'build-umd' ],
         },
         gruntFile: {
            files: [ config.js.gruntFile ],
            options: {
               reload: true,
            },
         },
      },
   });

   grunt.loadNpmTasks('grunt-eslint');
   grunt.loadNpmTasks('grunt-exec');
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-sass');
   grunt.loadNpmTasks('grunt-sass-lint');

   grunt.registerTask('standards', [ 'eslint:target', 'exec:standards', 'sasslint' ]);
   grunt.registerTask('standards-fix', [ 'eslint:fix' ]);

   grunt.registerTask('build-umd', [ 'exec:webpackUMD' ]);
   grunt.registerTask('build', [ 'build-umd', 'sass:build', 'copy:thirdparty' ]);

   grunt.registerTask('develop', [ 'clean:dist', 'build', 'watch' ]);

   grunt.registerTask('default', [ 'standards' ]);
};
