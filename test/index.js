import { user as setup, http } from "../src";

var tbody = document.querySelector("tbody");
setup(function(obj){
  var row = document.createElement("tr"),
    cell1 = document.createElement("td"),
    cell2 = document.createElement("td"),
    cell3 = document.createElement("td");
  cell1.appendChild(document.createTextNode(performance.now().toFixed(3)));
  cell2.appendChild(document.createTextNode(obj.name));
  cell3.appendChild(document.createTextNode(obj.args.map(function(o){
    return JSON.stringify(o);
  }).join(", ")));
  row.appendChild(cell1);
  row.appendChild(cell2);
  row.appendChild(cell3);
  tbody.appendChild(row);
});

console.log("OK");

var parts = ["log", "error", "warn", "info"];
for(var i = 0; i < 100; ++i){
  console[parts[i % parts.length]]("Message #", i);
}

throw new Error("Whooops!");