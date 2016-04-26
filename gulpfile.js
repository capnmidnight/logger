var gulp = require("gulp"),
  babel = require("gulp-babel"),
  jshint = require("gulp-jshint"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify");

gulp.task("default", function () {
  return gulp.src("logger.js")
    .pipe(jshint({
      multistr: true
    }))
	.pipe(babel({
      sourceMap: false,
      presets: ["es2015"]
    }))
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./"));
});