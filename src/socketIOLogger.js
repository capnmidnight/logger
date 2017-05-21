var readline = require("readline"),
  io = require("socket.io")(),
  clients = [],
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    historySize: 30,
    removeHistoryDuplicates: true,
    prompt: "CMD:> "
  });

rl.on("line", function(input) {
  clients.forEach((client) =>
    client.emit("command", input.trim()));
  rl.prompt();
});

module.exports = function socketIOLogger(client) {
  clients.push(client);
  client.on("logging", function(data) {
    var func = console[data.name];
    if(func){
      data.args.unshift("\n" + data.name.toLocaleUpperCase() + ":> ");
      data.args.push("\n");
      func.apply(console, data.args);
    }
    else{
      console.log(data);
    }
    rl.prompt();
  });

  client.on("disconnect", function() {
    var index = clients.indexOf(client);
    console.log("disconnecting client", index);
    clients.splice(index, 1);
    rl.prompt();
  });

  rl.prompt();
};
