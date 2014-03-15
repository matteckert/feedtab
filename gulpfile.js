var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

var paths = {
    gulpfile : 'gulpfile.js',
    tests : 'test/**/*.js',
    source : 'src/**/*.js',
};

gulp.task('default', ['lint', 'test']);

gulp.task('lint', function(done) {
    return gulp.src([paths.tests, paths.source])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', ['lint'], function() {
    return gulp.src(paths.tests)
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('watch', ['test'], function () {
    gulp.watch(allpaths, ['test']);
});
