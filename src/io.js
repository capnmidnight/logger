import wrap from "./wrap";
import withFileSystemWarning from "./withFileSystemWarning";
import io from "socket.io/lib/client";

export default function socketio(host, target, redirects) {
  const socket = io(host);
  return wrap(withFileSystemWarning(function (data) {
    socket.emit("logging", data);
    return data;
  }), target, redirects);
}
