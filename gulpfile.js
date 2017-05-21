var gulp = require("gulp"),
  pkg = require("./package.json"),
  marigold = require("marigold-build").setup(gulp, pkg),
  js = marigold.js({
    disableGenerators: true,
    globals: {
      "socket.io/lib/client": "io"
    }
  }),
  html = marigold.html(["*.pug"]),
  devServer = marigold.devServer([
      "src/**/*",
      "*.pug"
    ], [
      "!gulpfile.js",
      "*.js",
      "*.html"
    ], {
      mode: "dev",
      webSocketServer: require("./src/socketIOLogger")
    });

marigold.taskify([js, html], {
  default: devServer
});
