var gulp = require('gulp'),
  concat = require('gulp-concat'),
  plumber = require('gulp-plumber'),
  sass = require('gulp-sass'),
  watch = require('gulp-watch'),
  coffee = require('gulp-coffee');
  // post css
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer');
var config = require('./gulpconfig');

// javascript lib
gulp.task('js-lib', function() {
  libs = [];
  for (var i = 0; i < config.lib.js.length; i++) {
    libs.push(config.paths.bower + config.lib.js[i]);
  }
  libs.push(config.lib.jsVendor)
  gulp.src(libs)
    .pipe(plumber())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(config.paths.public + config.paths.js_output));
});

gulp.task('coffee', function() {
  gulp.src([config.paths.coffee + '**/**.coffee'])
    .pipe(plumber())
    .pipe(coffee({bare: true}))
    .pipe(concat('all.js'))
      .pipe(gulp.dest(config.paths.public + config.paths.js_output));
});
watch([config.paths.coffee + '**/**.coffee'], function() {
  gulp.start('coffee');
});


// Sass
gulp.task('sass', function() {
  gulp.src([config.paths.sass + '**/**.scss'])
    .pipe(plumber())
    .pipe(sass({outputStyle: config.sass.output_style}).on('error', sass.logError))
      .pipe(gulp.dest(config.paths.public + config.paths.sass_output));
});
watch([config.paths.sass + '**/*.scss'], function() {
  gulp.start('sass');
});

// postCSS
gulp.task('css', function () {
  var processors = [
    autoprefixer(config.postcss.autoprefixer)
  ];
  if (config.postcss.enabled){
    watch(config.paths.public + config.paths.sass_output + '**/**.css', function(){
      gulp.src(config.paths.public + config.paths.sass_output + '**/**.css')
        .pipe(plumber())
        // .pipe(concat(config.postcss.output_name))
        .pipe(postcss(processors))
        .pipe(gulp.dest(config.paths.public + config.postcss.output_folder));
    });
  }

});

// // 其它不編譯的物件
var objs = [config.paths.source + '**/**.*'];
for (var i = 0; i < config.others.length; i++) {
  objs.push('!' + config.paths.source + config.others[i]);
}
gulp.task('others', function(){
  return gulp.src(objs)
    .pipe(plumber())
    .pipe(gulp.dest(config.paths.public));
});
watch(objs, function() {
  gulp.start('others');
});

gulp.task('default', ['sass', 'css', 'js-lib', 'coffee', 'others']);
