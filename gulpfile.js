var gulp = require("gulp"),
  nt = require("notiontheory-basic-build").setup(gulp),
  js = nt.js("bare-bones-logger", "src", ["format"]);

gulp.task("format", [js.format]);
gulp.task("default", [js.default]);
gulp.task("release", [js.build]);