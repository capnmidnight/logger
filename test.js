(function () {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();















var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

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
      if ((typeof elem === "undefined" ? "undefined" : _typeof(elem)) === "object" && !(elem instanceof String)) {
        var obj1 = elem,
            obj2 = {};
        for (var key in obj1) {
          obj2[key] = obj1[key];
          if (obj2[key] !== null && obj2[key] !== undefined) {
            obj2[key] = obj2[key].toString();
          }
        }
        args.push(obj2);
      } else if (elem) {
        args.push(elem.toString());
      } else {
        args.push("null");
      }
    }
    var obj = send({
      name: name,
      args: args
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

  while (!done && console[name]) {
    try {
      console[name](data);
      done = true;
    } catch (exp) {
      name = mangle(name);
    }
  }
}

function wrap(send) {
  var redirects = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ["log", "info", "error"];

  if (send !== null) {
    redirects.forEach(function (name) {
      return console[name] = wrapFunction(send, name);
    });
  }

  window.addEventListener("error", function (evt) {
    onError(evt.message, evt.filename, evt.lineno, evt.colno, evt.error);
  }, false);
}

function user(target, redirects) {
  if (!(target instanceof Function)) {
    console.warn("The target parameter was expected to be a function, but it was", target);
  } else {
    return wrap(target, redirects);
  }
}

function identity(data) {
  return data;
}

var tbody = document.querySelector("tbody");
user(function (obj) {
  var row = document.createElement("tr"),
      cell1 = document.createElement("td"),
      cell2 = document.createElement("td"),
      cell3 = document.createElement("td");
  cell1.appendChild(document.createTextNode(performance.now().toFixed(3)));
  cell2.appendChild(document.createTextNode(obj.name));
  cell3.appendChild(document.createTextNode(obj.args.map(function (o) {
    return JSON.stringify(o);
  }).join(", ")));
  row.appendChild(cell1);
  row.appendChild(cell2);
  row.appendChild(cell3);
  tbody.appendChild(row);
});

console.log("OK");

var parts = ["log", "error", "warn", "info"];
for (var i = 0; i < 100; ++i) {
  console[parts[i % parts.length]]("Message #", i);
}

throw new Error("Whooops!");

}());
//# sourceMappingURL=test.js.map
