;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.logger = factory();
  }
}(this, function() {
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var send = null;

function cloneArgs(args) {
  var output = [];
  for (var i = 0; i < args.length; ++i) {
    if (_typeof(args[i]) === "object" && !(args[i] instanceof String)) {
      var obj1 = args[i],
          obj2 = {};
      for (var key in obj1) {
        obj2[key] = obj1[key];
        if (obj2[key] !== null && obj2[key] !== undefined) {
          obj2[key] = obj2[key].toString();
        }
      }
      output.push(obj2);
    } else {
      output.push(args[i].toString());
    }
  }
  return output;
}

function mangle(name) {
  return "_" + name;
}

function wrap(name) {
  var orig = name;
  while (console[orig]) {
    orig = mangle(orig);
  }
  console[orig] = console[name];
  return function () {
    var obj = send({
      name: name,
      args: cloneArgs(arguments)
    });
    if (obj) {
      console[orig].apply(console, obj.args);
    }
  };
}

var logger = {
  setup: null,
  DISABLED: 0,
  HTTP: 1,
  WEBSOCKET: 2,
  DOM: 3,
  USER: 4
};

logger.setup = function setup(type, target) {
  if (type !== logger.DISABLED) {
    if ((type === logger.HTTP || type === logger.WEBSOCKET) && location.protocol === "file:") {
      console.warn("Can't perform HTTP requests from the file system. Not going to setup the error proxy, but will setup the error catch-all.");
    } else if (type === logger.HTTP) {
      send = function send(data) {
        var req = new XMLHttpRequest();
        req.open("POST", target);
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.send(JSON.stringify(data));
        return data;
      };
    } else if (type === logger.WEBSOCKET) {
      var socket = new WebSocket(target);
      send = function send(data) {
        socket.send(JSON.stringify(data));
        return data;
      };
    } else if (type === logger.DOM) {
      var output = document.querySelector(target);
      send = function send(data) {
        var elem = document.createElement("pre");
        elem.appendChild(document.createTextNode(JSON.stringify(data)));
        output.appendChild(elem);
        return data;
      };
    } else if (type === logger.USER) {
      if (!(target instanceof Function)) {
        console.warn("The target parameter was expected to be a function, but it was", target);
      } else {
        send = target;
      }
    }

    if (send !== null) {
      ["log", "info", "warn", "error"].forEach(function (n) {
        console[n] = wrap(n);
      });
    }

    window.onerror = function (message, source, lineno, colno, error) {
      var done = false,
          name = "error",
          data = {
        time: new Date().toLocaleTimeString(),
        message: message,
        source: source,
        lineno: lineno,
        colno: colno,
        error: error.message
      };
      while (!done && console[name]) {
        try {
          console[name](data);
          done = true;
        } catch (exp) {
          name = mangle(name);
        }
      }
    };
  }
};
return logger;
}));
