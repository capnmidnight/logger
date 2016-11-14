import wrap from "./wrap";
import withFileSystemWarning from "./withFileSystemWarning";

export default function webSocket(target, redirects) {
  const socket = new WebSocket(target);
  return wrap(fileSystemWarning(function (data) {
    socket.send(JSON.stringify(data));
    return data;
  }), redirects);
}
