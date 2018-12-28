/**
 * Main entry point for the application
 */
// Dependencies 
var server = require('./libs/server');

// Container for the app
var app = {};

// Initialize the app
app.init = function () {
    server.init();
}

// Execute app
app.init();

module.exports = app;