/**
 * Server releated tasks
 */

// Dependencies
const http = require('http');
const https = require('https');
const config = require('./config');
const fs = require('fs');
const path = require('path');
const handlers = require('./route-handlers');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const helpers = require('./helpers');

// Intantiate Server
var server = {};

// Intantiate http server
server.httpServer = http.createServer(function (req, res) {
    server.commonServerConfig(req, res);
});

// Https server options
server.httpsServeroptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../ssl/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname,'/../ssl/cert.pem'))
}
// Intantiate https server
server.httpsServer = https.createServer(server.httpsServeroptions, function (req, res) {
    server.commonServerConfig(req, res);
});

// Common server config for http and https server
server.commonServerConfig = function(req, res){
    
    // Get the url and parse it, setting second param true tell the parse method to parse it has object as well or it would be treated as string
    const parsedUrl =  url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get method
    const method = req.method.toLowerCase();

    // Get query string
    const queryString = parsedUrl.query;

    // Get headers
    const headers = req.headers;

    // Get Payload if any
    const decoder = new StringDecoder('utf-8');

    let buffer = '';

    req.on('data', function(stream) {
        buffer += decoder.write(stream);
    });

    req.on('end', function() {
        buffer += decoder.end();

        const data = {
            path: trimmedPath,
            method: method,
            headers: headers,
            queryString: queryString,
            payload: helpers.parseJsonToObject(buffer)
        }
        
        const chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : server.router.notFound;

        chosenHandler(data, function(statusCode, response) {
            // default to 200 if status is not number
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            
            // default to empty object if response in not an object
            response =  typeof(response) =='object' ? response : {};

            // Convert the response to string to sent to the user
            responseString = JSON.stringify(response);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHeader(statusCode);
            res.end(responseString);

            // Log the response in green for success and red on failure
            if([200,201].indexOf(statusCode) > -1){
                console.log('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+ statusCode);
            } else {
                console.log('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+ statusCode);
            }
        });
    });
};

server.router = {
    'users': handlers.users,
    'tokens': handlers.tokens,
    'menus': handlers.menus,
    'orders': handlers.orders,
    'checkout': handlers.checkout,
    'notFound': handlers.notFound
};

// init server 
server.init = function () {
    server.httpServer.listen(config.httpPort, function(){
        console.log('Server listening on port ' + config.httpPort)
    });

    server.httpsServer.listen(config.httpsPort, function(){
        console.log('Server listening on port ' + config.httpsPort)
    });
}

// Export 
module.exports = server;