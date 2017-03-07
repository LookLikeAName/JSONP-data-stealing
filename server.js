var querystring = require("querystring");

function server(route,handle){
var http = require("http");
var url= require("url");
function onRequest(request, response) {	
 // console.log("On request");
  var pathname=url.parse(request.url).pathname;
  var getdata=querystring.parse(url.parse(request.url).query);
  var postdata="";
  // console.log(getdata);
  request.setEncoding("utf8");
  request.addListener("data",function(postdataS){postdata+=postdataS;
    console.log(postdataS+"\n");
  });
  request.addListener("end",function(){route(pathname,handle,response,postdata,getdata,request);});
  
  
}
http.createServer(onRequest).listen(8888);

console.log("server start!");
}

exports.server=server;