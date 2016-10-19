var gulp = require("gulp"),
  pkg = require("./package.json"),
  nt = require("../notiontheory-basic-build/src").setup(gulp, pkg),
  js = nt.js("bare-bones-logger", "src", ["format"]),
  jsDev = nt.js("bare-bones-logger", "src", ["format"], null, true);

gulp.task("format", [js.format]);
gulp.task("default", [jsDev.default]);
gulp.task("release", [js.build]);