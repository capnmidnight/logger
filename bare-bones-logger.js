(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('socket.io/lib/client')) :
	typeof define === 'function' && define.amd ? define(['exports', 'socket.io/lib/client'], factory) :
	(factory((global.BareBonesLogger = global.BareBonesLogger || {}),global.io));
}(this, (function (exports,io) { 'use strict';

io = 'default' in io ? io['default'] : io;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

function mangle(name) {
  return "_" + name;
}

function wrapFunction(target, send, name) {
  var orig = name;
  while (target[orig]) {
    orig = mangle(orig);
  }
  if (target[name]) {
    target[orig] = target[name];
  } else {
    orig = null;
  }
  target[name] = function () {
    var args = [];
    for (var i = 0; i < arguments.length; ++i) {
      var elem = arguments[i];
      if (elem === null) {
        args.push("null");
      } else if (elem === undefined) {
        args.push("undefined");
      } else if ((typeof elem === "undefined" ? "undefined" : _typeof(elem)) === "object" && !(elem instanceof String)) {
        var obj1 = elem,
            obj2 = {};
        for (var key in obj1) {
          obj2[key] = obj1[key];
          if (obj2[key] !== null && obj2[key] !== undefined) {
            obj2[key] = obj2[key].toString();
          }
        }
        args.push(obj2);
      } else {
        args.push(elem.toString());
      }
    }

    var obj = send({ name: name, args: args });
    if (orig && target[orig] && obj) {
      target[orig].apply(target, arguments);
    }
  };
}

function onError(target, message, source, lineno, colno, error) {
  colno = colno || window.event && window.event.errorCharacter;
  var done = false,
      name = "error",
      stack = error && error.stack;

  if (!stack) {
    if (arguments.callee) {
      var head = arguments.callee.caller;
      while (head) {
        stack.push(head.name);
        head = head.caller;
      }
    } else {
      stack = "N/A";
    }
  }

  var data = {
    type: "error",
    time: new Date().toLocaleTimeString(),
    message: message,
    source: source,
    lineno: lineno,
    colno: colno,
    error: error.message,
    stack: stack
  };

  while (!done && target[name]) {
    try {
      target[name](data);
      done = true;
    } catch (exp) {
      name = mangle(name);
    }
  }
}

function wrap(send) {
  var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : console;
  var redirects = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ["log", "info", "error"];

  if (send !== null) {
    redirects.forEach(function (name) {
      return wrapFunction(target, send, name);
    });
  }

  window.addEventListener("error", function (evt) {
    onError(target, evt.message, evt.filename, evt.lineno, evt.colno, evt.error);
  }, false);

  return target;
}

function dom(host, target, redirects) {
  var output = document.querySelector(host);
  return wrap(function (data) {
    var elem = document.createElement("pre");
    elem.appendChild(document.createTextNode(JSON.stringify(data)));
    output.appendChild(elem);
    return data;
  }, target, redirects);
}

function identity(data) {
  return data;
}

function withFileSystemWarning(thunk) {
  var isBad = location.protocol === "file:";

  if (isBad) {
    console.warn("Can't perform HTTP requests from the file system. Not going to setup the error proxy, but will setup the error catch-all.");
  }

  return isBad ? identity : thunk;
}

function http(host, target, redirects) {
  return wrap(withFileSystemWarning(function (data) {
    var req = new XMLHttpRequest();
    req.open("POST", host);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(JSON.stringify(data));
    return data;
  }), target, redirects);
}

function socketio(host, target, redirects) {
  var socket = io(host);
  return wrap(withFileSystemWarning(function (data) {
    socket.emit("logging", data);
    return data;
  }), target, redirects);
}

function user(host, target, redirects) {
  if (!(host instanceof Function)) {
    console.warn("The host parameter was expected to be a function, but it was", host);
  } else {
    return wrap(host, target, redirects);
  }
}

function webSocket(host, target, redirects) {
  var socket = new WebSocket(host);
  return wrap(withFileSystemWarning(function (data) {
    socket.send(JSON.stringify(data));
    return data;
  }), target, redirects);
}

exports.dom = dom;
exports.http = http;
exports.io = socketio;
exports.user = user;
exports.webSocket = webSocket;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=bare-bones-logger.js.map
