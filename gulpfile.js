var gulp = require("gulp"),
  pkg = require("./package.json"),
  build = require("notiontheory-basic-build"),
  nt = build.setup(gulp, pkg),
  js = nt.js("bare-bones-logger", "src", ["format"]),
  min = nt.min("bare-bones-logger", ["bareBonesLogger.js"], [js.debug]),
  test = nt.js("test", "test");

gulp.task("test", [test.debug]);

gulp.task("format", [js.format]);
gulp.task("default", [js.default]);
gulp.task("debug", [js.debug]);
gulp.task("release", [min.release]);


gulp.task("kablamo", build.exec("gulp bump && gulp yolo && npm publish"));