/**
 *  Handling all rotutes
 */

// Dependencies
const usersRouteHandler = require('../routes/users');
const tokensRouteHandler = require('../routes/tokens');
const menusRouteHandler = require('../routes/menus');
const ordersRouteHandler = require('../routes/orders');
const checkRouteHandler = require('../routes/checkout')

// Instantiate Handler
const handlers = {};

// List of acceptable methods
const acceptableMethods = ['get', 'post', 'put', 'delete'];

// Container for sub routes
handlers._users = usersRouteHandler;
handlers._tokens = tokensRouteHandler;
handlers._menus = menusRouteHandler;
handlers._orders = ordersRouteHandler;
handlers._checkout = checkRouteHandler;

// Users Routes
handlers.users = function (data, callback) {
    handlers.checkMethods('_users', data, callback);
}

// Tokens Routes
handlers.tokens = function(data, callback) {
    handlers.checkMethods('_tokens', data, callback);
}

// Menus Routes
handlers.menus = function(data, callback) {
    handlers.checkMethods('_menus', data, callback);
}

// Orders Routes
handlers.orders = function(data, callback) {
    handlers.checkMethods('_orders', data, callback);
}

// Checkout Routes
handlers.checkout = function(data, callback) {
    handlers.checkMethods('_checkout', data, callback);
}

// Not Found
handlers.notFound = function (data, callback) {
    callback(404, {
        'status': 'fail',
        'message': 'Route not found'
    });
}

// Check for acceptable methods and redirect
handlers.checkMethods = function(routeName, data, callback){
    if (acceptableMethods.indexOf(data.method.toLowerCase()) > -1) {
        handlers[routeName][data.method](data, callback);
    } else {
        callback(405);
    }
}

// Export Handler
module.exports = handlers