const gulp = require('gulp');
const umd = require('gulp-umd');

return gulp.src('dist/ScrollSwipe.js')
    .pipe(umd({
        dependencies: function(file) {
          return [];
        }
      }))
    .pipe(gulp.dest('dist'));