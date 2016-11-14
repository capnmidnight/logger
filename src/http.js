import wrap from "./wrap";
import withFileSystemWarning from "./withFileSystemWarning";

export default function http(target, redirects) {
  return wrap(fileSystemWarning(function (data) {
    var req = new XMLHttpRequest();
    req.open("POST", target);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(JSON.stringify(data));
    return data;
  }), redirects);
}
