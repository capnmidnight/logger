var send = null;

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
    var args = [];
    for (var i = 0; i < arguments.length; ++i) {
      if (typeof arguments[i] === "object" && !(arguments[i] instanceof String)) {
        var obj1 = arguments[i],
          obj2 = {};
        for (var key in obj1) {
          obj2[key] = obj1[key];
          if (obj2[key] !== null && obj2[key] !== undefined) {
            obj2[key] = obj2[key].toString();
          }
        }
        args.push(obj2);
      }
      else {
        args.push(arguments[i].toString());
      }
    }
    var obj = send({
      name,
      args
    });
    if (obj) {
      console[orig].apply(console, obj.args);
    }
  };
}

function onError(message, source, lineno, colno, error) {
  colno = colno || window.event && window.event.errorCharacter;
  var done = false,
    name = "error",
    stack = error && error.stack;

  if(!stack){
    if(arguments.callee){
      var head = arguments.callee.caller;
      while(head){
        stack.push(head.name);
        head = head.caller;
      }
    }
    else{
      stack = "N/A";
    }
  }

  var data = {
      type: "error",
      time: (new Date())
        .toLocaleTimeString(),
      message: message,
      source: source,
      lineno: lineno,
      colno: colno,
      error: error.message,
      stack: stack
    };

  while (!done && console[name]) {
    try {
      console[name](data);
      done = true;
    }
    catch (exp) {
      name = mangle(name);
    }
  }
}

function setup(type, target) {
  if (type !== logger.DISABLED) {
    if ((type === logger.HTTP || type === logger.WEBSOCKET) && location.protocol === "file:") {
      console.warn("Can't perform HTTP requests from the file system. Not going to setup the error proxy, but will setup the error catch-all.");
    }
    else if (type === logger.HTTP) {
      send = function (data) {
        var req = new XMLHttpRequest();
        req.open("POST", target);
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.send(JSON.stringify(data));
        return data;
      };
    }
    else if (type === logger.WEBSOCKET) {
      var socket = new WebSocket(target);
      send = function (data) {
        socket.send(JSON.stringify(data));
        return data;
      };
    }
    else if (type === logger.DOM) {
      var output = document.querySelector(target);
      send = function (data) {
        var elem = document.createElement("pre");
        elem.appendChild(document.createTextNode(JSON.stringify(data)));
        output.appendChild(elem);
        return data;
      };
    }
    else if (type === logger.USER) {
      if (!(target instanceof Function)) {
        console.warn("The target parameter was expected to be a function, but it was", target);
      }
      else {
        send = target;
      }
    }

    if (send !== null) {
      ["log", "info", "warn", "error"].forEach(function (n) {
        console[n] = wrap(n);
      });
    }

    window.addEventListener("error", function(evt){
      onError(evt.message, evt.filename, evt.lineno, evt.colno, evt.error);
    }, false);
  }
}