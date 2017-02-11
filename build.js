const gulp = require('gulp');
const umd = require('gulp-umd');

return gulp.src('dist/ScrollDetect.js')
    .pipe(umd({
        dependencies: function(file) {
          return [];
        }
      }))
    .pipe(gulp.dest('dist'));