var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var browserify = require('browserify');

var paths = {
    gulpfile : 'gulpfile.js',
    test : 'test/**/*.js',
    source : 'src/**/*.js'
};

gulp.task('default', ['build']);

gulp.task('lint', function(done) {
    return gulp.src([paths.test, paths.source])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', ['lint'], function() {
    return gulp.src(paths.test)
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('build', ['test'], function() {
	var bundled = browserify();
    bundled.add('./src/index.js');
    bundled.bundle()
		.pipe(source('background.js'))
		//.pipe(streamify(uglify()))
		.pipe(gulp.dest('./build'));
});
