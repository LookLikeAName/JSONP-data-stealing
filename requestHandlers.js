
var querystring = require("querystring");
var url= require("url");

function dataGet(response,postdata,getdata,request) {
  console.log("Request handler 'dataGet' was called.");
  console.log(getdata);
  var responseScript="document.getElementById('newScript').remove();";
   response.write(responseScript);
   response.end();
}

exports.dataGet = dataGet;