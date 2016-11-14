function mangle(name) {
  return "_" + name;
}

function wrapFunction(send, name) {
  var orig = name;
  while (console[orig]) {
    orig = mangle(orig);
  }
  console[orig] = console[name];
  return function () {
    var args = [];
    for (var i = 0; i < arguments.length; ++i) {
      var elem = arguments[i];
      if(elem === null) {
        args.push("null");
      }
      else if(elem === undefined) {
        args.push("undefined");
      }
      else if (typeof elem === "object" && !(elem instanceof String)) {
        var obj1 = elem,
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
        args.push(elem.toString());
      }
    }
    var obj = send({
      name,
      args
    });
    if (obj) {
      console[orig].apply(console, arguments);
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

export default function wrap(send, redirects = ["log", "info", "error"]) {
  if (send !== null) {
    redirects.forEach((name) =>
      console[name] = wrapFunction(send, name));
  }

  window.addEventListener("error", function(evt){
    onError(evt.message, evt.filename, evt.lineno, evt.colno, evt.error);
  }, false);
};