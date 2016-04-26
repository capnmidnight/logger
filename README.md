# Logger proxy

Any console.log, console.error, console.warn, or console.info you call will get routed to a different function of your choosing.

There are built-in handlers for POSTing a JSON document to an HTTP, sending a JSON string to a WebSocket server, or printing a JSON string out in an &lt;pre> tag in a DOM element.

Additionally, you may pass a single-parameter function as the handler and do whatever you want after that.

Subsequent calls of `logger.setup` will chain calls together.

  
## Example:

    // HTTP POST to the relative URL /log/
    logger.setup(logger.HTTP, "/log/");

    // WebSocket on localhost
    logger.setup(logger.WEBSOCKET, "ws://localhost");

    // DOM element in the page
    logger.setup(logger.DOM, "#idOfContainerElement");
    
    // Or something really stupid:
    logger.setup(logger.USER, alert);

    // When you're done, just change the type to DISABLED and no proxy will be created
    logger.setup(logger.DISABLED, "doesn't matter what is here");
	
The data sent to the proxy is a JSON object of the form:

    {
	    "name": "log", // or error, warn, info
		"args": [...] // a list of arguments used in the call
    }
	
If any of the arguments are typeof === "object", then a shallow serialization of the object is performed, one level of properties deep. If any of those properties are objects, they will appear as the string "[Object object]".