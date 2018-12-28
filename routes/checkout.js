/**
 * Checkout route handlers
 */

// Dependencies
const storeHelper = require('../libs/store');
const tokens = require('../routes/tokens');
const menus = require('../routes/menus');
const helpers = require('../libs/helpers');
// Instantiate menus
const checkout = {};

// POST
// Required fields: email, orderId
// Optional fields: none
checkout.post = function (data, callback) {
    // Validate fields
    const email = typeof (data.payload.email) == 'string' && data.payload.email.trim().length && helpers.validateEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;
    const orderId = typeof (data.payload.orderId) == 'string' && data.payload.orderId.trim().length ? data.payload.orderId.trim() : false;
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

    if (email && orderId && tokenId) {
        // validate the token
        tokens.verifyToken(tokenId, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the order
                storeHelper.read('orders', orderId, function(err, orderData) {
                    if(!err) {
                        // Create charge for the order
                        helpers.createCharge(orderData.total,'usd', null, 'Charges for your pizza order', function(err){
                            if(!err) {
                                helpers.sendEmail(email,'Pizza Delivery receipt' + orderData.total, 'Here is your receipt for ' + orderData.orderDetails.length + ' items purchased. Total $' + orderData.total + '.', function(err){
                                    if(!err) {
                                        callback(200, {
                                            'status': 'ok',
                                            'message': 'Payment was successful'
                                        })
                                    } else {
                                        callback(500, {
                                            'status': 'fail',
                                            'message': 'Error in sending receipt mail'
                                        });
                                    }
                                })
                            } else {
                                callback(500, {
                                    'status': 'fail',
                                    'message': 'Error in creating payment'
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            'status': 'fail',
                            'message': 'Provided order id does not exist'
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

// Export token
module.exports = checkout;