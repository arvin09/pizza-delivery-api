/**
 * Orders route handlers
 */

// Dependencies
const storeHelper = require('../libs/store');
const tokens = require('../routes/tokens');
const menus = require('../routes/menus');
const helpers = require('../libs/helpers');

// Instantiate menus
const orders = {};

// GET
// Required fields: email
// Optional fields: orderId
orders.get = function (data, callback) {
    // Validate fields
    const email = typeof (data.queryString.email) == 'string' && data.queryString.email.trim().length && helpers.validateEmail(data.queryString.email.trim()) ? data.queryString.email.trim() : false;
    const orderId = typeof (data.queryString.orderId) == 'string' && data.queryString.orderId.trim().length ? data.queryString.orderId.trim() : false;
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

    if (email && tokenId) {
        // validate the token
        tokens.verifyToken(tokenId, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the order
                if(orderId)
                storeHelper.read('orders', orderId, function(err, orderData) {
                    if(!err) {
                        callback(200, {
                            'status': 'ok',
                            'message': 'Order found',
                            'data': orderData
                        })
                    } else {
                        callback(404, {
                            'status': 'fail',
                            'message': 'Provided orderId does not exist'
                        });
                    }
                });
               
            } else {
                callback(403, {
                    'status': 'fail',
                    'message': 'Token has expired'
                });
            }
        });

    } else {
        callback(400, {
            status: 'fail',
            message: 'Missing required fields or missing token'
        })
    }
}

// POST
// Required fields: email, menuid's
// Optional fields: none
orders.post = function (data, callback) {
    // Validate fields
    const email = typeof (data.payload.email) == 'string' && data.payload.email.trim().length && helpers.validateEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;
    const itemDetails = typeof (data.payload.itemDetails) == 'object' && data.payload.itemDetails instanceof Array ? data.payload.itemDetails : [];
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

    if (email && itemDetails.length && tokenId) {
        // validate the token
        tokens.verifyToken(tokenId, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // Check the menu items exist and get the selected Item data
                menus.getSelectedMenuItems(itemDetails, function (err, selectedMenuItems) {
                    if (!err && selectedMenuItems.length) {
                        // Create object to store for order
                        const orderObject = {
                            orderId: email+Date.now(),
                            email: email,
                            orderDetails: itemDetails,
                            total: orders.getTotal(selectedMenuItems),
                            date: Date.now(),
                            completed: false
                        }

                        storeHelper.create('orders', orderObject.orderId, orderObject, function(err) {
                            if(!err) {
                                callback(200, {
                                    status: 'ok',
                                    message: 'Successfully created order',
                                    data: orderObject
                                })
                            } else {
                                callback(500, {
                                    status: 'fail',
                                    message: 'Error creating order'
                                })
                            }
                        })

                    } else {
                        callback(400, {
                            'status': 'fail',
                            'message': 'Invalid menu item/s provided'
                        });
                    }
                })

            } else {
                callback(403, {
                    'status': 'fail',
                    'message': 'Token has expired'
                });
            }
        });

    } else {
        callback(400, {
            status: 'fail',
            message: 'Missing required fields or missing token'
        })
    }
}

orders.getTotal = function (selectedMenuItems) {
    let total = 0;
    selectedMenuItems.forEach(function (item) {
        total += item.quantity * item.price
    });
    return total;
}

// Export token
module.exports = orders