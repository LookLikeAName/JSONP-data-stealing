function route(pathname,handle,response,postdata,getdata,request) {
	 console.log("About to route a request for " + pathname);
	
	if(typeof handle[pathname]==='function')
	{
		 console.log("function request for " + pathname);
		handle[pathname](response,postdata,getdata,request);
		
	}
	else
	{
		 console.log("no request");
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 no friend");
		response.end();
	}
 
}

exports.route = route;