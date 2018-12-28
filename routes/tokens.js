/**
 * Token route handlers
 */

// Dependencies
const storeHelper = require('../libs/store');
const helpers = require('../libs/helpers');

// Instantiate tokens
const tokens = {}


// GET
// Required fields: id,
// Optional fields: none 
tokens.get = function (data, callback) {
    // Validate fields
    const id = typeof (data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;

    if (id) {
        // Lookup the token
        storeHelper.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, {
                    'status': 'fail',
                    'message': 'Could not find provided token or it has expired'
                });
            }
        })
    } else {
        callback(400, {
            'status': 'fail',
            'message': 'Missing required fields, check the provided token'
        })
    }
}

// POST
// Required fields: email, password,
// Optional fields: none 
tokens.post = function (data, callback) {
    // Validate fields
    const email = typeof (data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (email && password) {
        // Look up he user object
        storeHelper.read('users', email, function (err, userData) {
            if (!err && userData) {
                // Hash the provided password for check
                const hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.password) {
                    // create the new token with and expiration set for an hour
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;

                    // create the token Object
                    const tokenObject = {
                        id: tokenId,
                        email: email,
                        expires: expires
                    }

                    storeHelper.create('tokens', tokenId, tokenObject, function (err) {
                        if (!err) {
                            callback(200, tokenObject)
                        } else {
                            callback(500, {
                                'status': 'fail',
                                'message': 'Could not create the new token'
                            });
                        }
                    })
                }
            } else {
                callback(404, {
                    'status': 'fail',
                    'message': 'User with the provided email does not exist'
                });
            }
        })
    } else {
        callback(400, {
            'status': 'fail',
            'message': 'Missing required fields'
        })
    }
}

// PUT - extend the expiration of the token by 1 hour
// Required fields: email, password,
// Optional fields: none 
tokens.put = function (data, callback) {
    /// Validate fields
    const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    const extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if (id && extend) {
        // Look up the token
        storeHelper.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                // Check if token is valid
                if (tokenData.expires > Date.now()) {
                    // Extend the expiration
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Update the token
                    storeHelper.update('tokens', id, tokenData, function (err) {
                        if (!err) {
                            callback(200, {
                                'status': 'ok',
                                'message': 'Successfully extend the token expiration',
                                'data': tokenData
                            });
                        } else {
                            callback(500, {
                                'status': 'fail',
                                'message': 'Could not update the token'
                            })
                        }
                    })

                } else {
                    callback(400, {
                        'status': 'fail',
                        'message': 'Token is expired and cannot be extended'
                    })
                }
            } else {
                callback(404, {
                    'status': 'fail',
                    'message': 'Could not found the provided token'
                })
            }
        });
    } else {
        callback(400, {
            'status': 'fail',
            'message': 'Missing required fields'
        })
    }
}

// Tokens -delete
// Required data: id
// Optional data: none
tokens.delete = function (data, callback) {
    var id = typeof (data.queryString.id == 'string') && data.queryString.id && data.queryString.id.length == 20 ? data.queryString.id : false;
    if (id) {
        // Look up the user
        storeHelper.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                // Delete the token object
                storeHelper.delete('tokens', id, function (err) {
                    if (!err) {
                        callback(200, {
                            'status': 'ok',
                            'message': 'Successfully deleted the token'
                        })
                    } else {
                        callback(500, {
                            'status': 'fail',
                            'message': 'Could not delete the specified token'
                        });
                    }
                });
            } else {
                callback(400, {
                    'status': 'fail',
                    'message': 'Could not find the specified token'
                });
            }
        });
    } else {
        callback(400, {
            'Error': 'Missing required fields'
        });
    }
}

// Check for vaidity of the provided token
tokens.verifyToken = function (id, email, callback) {
        // Lookup token
        storeHelper.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                // verify the email and token is still valid
                if (tokenData.email === email && tokenData.expires > Date.now()) {
                    callback(true);
                } else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        })
    },

// Export token
module.exports = tokens