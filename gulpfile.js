var gulp = require("gulp"),
  nt = require("notiontheory-basic-build").setup(gulp),
  tasks = nt.js(
    "bare-bones-logger",
    ["src/**/*.js"]);

gulp.task("default", [tasks.dev]);
gulp.task("debug", [tasks.debug]);
gulp.task("release", [tasks.release]);