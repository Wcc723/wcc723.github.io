const gulp = require('gulp'),
  concat = require('gulp-concat'),
  plumber = require('gulp-plumber'),
  sass = require('gulp-sass'),
  watch = require('gulp-watch'),
  coffee = require('gulp-coffee');
  // post css
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer');
const config = require('./gulpconfig');

// javascript lib
gulp.task('js-lib', function() {
  libs = [];
  for (var i = 0; i < config.lib.js.length; i++) {
    libs.push(config.paths.bower + config.lib.js[i]);
  }
  libs.push(config.lib.jsVendor)
  return gulp.src(libs, { allowEmpty: true })
    .pipe(plumber())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(config.paths.public + config.paths.js_output));
});

gulp.task('coffee', function() {
  return gulp.src([config.paths.coffee + '**/**.coffee'])
    .pipe(plumber())
    .pipe(coffee({bare: true}))
    .pipe(concat('all.js'))
      .pipe(gulp.dest(config.paths.public + config.paths.js_output));
});


// Sass
gulp.task('sass', function() {
  return gulp.src([config.paths.sass + '**/**.scss'])
    .pipe(plumber())
    .pipe(sass({
      outputStyle: config.sass.output_style,
      includePaths: config.sass.includePaths,
    }).on('error', sass.logError))
      .pipe(gulp.dest(config.paths.public + config.paths.sass_output));
});


// postCSS
gulp.task('css', function () {
  const processors = [
    autoprefixer(config.postcss.autoprefixer)
  ];
  if (config.postcss.enabled){
    return gulp.src(config.paths.public + config.paths.sass_output + '**/**.css')
      .pipe(plumber())
      // .pipe(concat(config.postcss.output_name))
      .pipe(postcss(processors))
      .pipe(gulp.dest(config.paths.public + config.postcss.output_folder));
  }
});

// // 其它不編譯的物件
const objs = [config.paths.source + '**/**.*'];
for (let i = 0; i < config.others.length; i++) {
  objs.push('!' + config.paths.source + config.others[i]);
}
gulp.task('others', function(){
  return gulp.src(objs)
    .pipe(plumber())
    .pipe(gulp.dest(config.paths.public));
});


gulp.task('watch', function() {
  return gulp.watch([config.paths.sass + '**/*.scss'], gulp.series('sass', 'css'));
})

gulp.task('default', gulp.series('sass', 'css', 'js-lib', 'coffee', 'others', gulp.parallel('watch')));
