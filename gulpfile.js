var gulp = require('gulp');
var browserSync = require('browser-sync');
var nano = require('cssnano');
var cssnext = require('postcss-cssnext');
var concat  = require('gulp-concat-util');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var assets  = require('postcss-assets');
var gutil = require('gulp-util');
var twig = require('gulp-twig');
var neat = require('node-neat').includePaths;
//var liquify = require('gulp-liquify');
var data = require('gulp-data');
var path = require('path');


gulp.task('css', function () {
  var processors = [
    assets({loadPaths: ['public/img/']}),
    cssnext,
    nano
  ];
  return gulp.src('source/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: ['styles'].concat(neat)
    }).on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/css'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('thinkcss', function() {
  return gulp.src(['source/scss/1_settings/_colors.scss','source/scss/1_settings/_font-faces.scss','source/scss/1_settings/_variables.scss','source/scss/2_tools/*.scss','source/scss/3_generic/*.scss','source/scss/4_elements/*.scss','source/scss/5_components/*.scss','source/scss/6_modules/*.scss','source/scss/7_overrides/*.scss'])
    .pipe(concat('theme.css'))
    .pipe(gulp.dest('public'))
});

gulp.task('critical', function() {
  return gulp.src('public/css/critical.css')
    .pipe(concat.header('<style>'))
    .pipe(concat.footer('</style>'))
    .pipe(rename({
        basename: 'critical-css',
        extname: '.twig'
    }))
    .pipe(gulp.dest('source/templates/_includes'));
});

gulp.task('js', function () {
  return gulp.src([
      'source/js/components/*.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(concat('app.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('public/js'))
    .pipe(sourcemaps.write('.'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('js-pages', function() {
  gulp.src('source/js/*.js')
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('public/js'))
    .pipe(browserSync.reload({stream:true}))
});

//gulp.task('compile', function () {
//  var locals = {
//    siteName: 'Live Wires'
//  };
//  return gulp.src('source/templates/**/*.html')
//    .pipe(data(function(file) {
//      return require('./data/content.json');
//    }))
//    .pipe(liquify(locals, { base: "Snippets" }))
//    .pipe(gulp.dest('public'))
//    .pipe(browserSync.reload({stream:true}))
//});
//
gulp.task('compile', function () {
  return gulp.src('source/templates/**/*.html')
    .pipe(data(function(file) {
      return require('./data/content.json');
    }))
    .pipe(twig({
      base: 'source/templates'
    }))
    .pipe(gulp.dest('public'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('watch', function () {
  gulp.watch('source/scss/**/*.scss', ['css', 'thinkcss']);
  gulp.watch('source/js/**/*.js', ['js']);
  gulp.watch(['source/templates/**/*.html','data/**/*.json'], ['compile']).on('change', browserSync.reload);
});

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: "public/"
    }
  });
});

// OR dynamic server
//gulp.task('browser-sync', function() {
//  browserSync.init(['*.html'], {
//    proxy: 'livewires.dev'
//  });
//});

gulp.task('start', ['watch', 'critical', 'browser-sync']);

gulp.task('default', ['css', 'js', 'js-pages', 'critical', 'compile', 'thinkcss']);
