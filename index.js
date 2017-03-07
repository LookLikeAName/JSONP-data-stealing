var start=require("./server");
var route=require("./route");
var requestHandlers=require("./requestHandlers");

var handle={}
   handle["/dataGet"]=requestHandlers.dataGet;
start.server(route.route,handle);