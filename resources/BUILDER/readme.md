thư mục này dùng để tạo đoạn lệnh gulp file js
## npm install  or yarn install

## chỉnh sử file gulp để build js từ thư mục này sang thứ mục public của laravel 

demo gulp 
```
var gulp       = require('gulp');
var sass       = require('gulp-sass');
var livereload = require('gulp-livereload');
var minify     = require('gulp-minify');
var minifyCss  = require('gulp-minify-css');
var path       = require('path');
gulp.task('sass', function () {
   return gulp.src('SCSS/app.scss')
      .pipe(sass())
      .pipe(minifyCss({ compatibility: 'ie8' }))
      .pipe(gulp.dest(path.join(__dirname, '/../../public/css/')))
      .pipe(livereload());
});
gulp.task('script-app', function () {
   return gulp.src(['JAVASCRIPT/app.js'])
      .pipe(minify({
         ext: {
            min: '.min.js'
         },
         noSource: true
      }))
      .pipe(gulp.dest(path.join(__dirname, '/../../public/js/')))
      .pipe(livereload());
});
gulp.task('script-calendar', function () {
   return gulp.src(['JAVASCRIPT/canlendar.js'])
      .pipe(minify({
         ext: {
            min: '.min.js'
         },
         noSource: true
      }))
      .pipe(gulp.dest(path.join(__dirname, '/../../public/js/')))
      .pipe(livereload());
});
 
// Watch Files For Changes
gulp.task('watch', function () {
   livereload.listen();
   gulp.watch('SCSS/*/*.scss', gulp.series('sass'));
   gulp.watch('SCSS/app.scss', gulp.series('sass'));

   gulp.watch('JAVASCRIPT/calendar.js', gulp.series('script-calendar'));
   gulp.watch('JAVASCRIPT/app.js', gulp.series('script-app'));
});

```