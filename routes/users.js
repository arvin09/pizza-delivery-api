/**
 * Handler for user routes
 */

// Dependencies
const storeHelper = require('../libs/store');
const helpers = require('../libs/helpers');
const tokens = require('./tokens');

//Instantiate the user route handler
const users = {};
const dir = 'users';

// GET
// Required data: email
// Optional data: none
users.get = function (data, callback) {
    // Validate fields
    const email = typeof (data.queryString.email) == 'string' && data.queryString.email.trim().length > 0 ? data.queryString.email.trim() : false;

    if (email) {
        // Get the token from the header
        const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

        // validate the token
        tokens.verifyToken(tokenId, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // Lookup  the user 
                storeHelper.read(dir, email, function (err, userData) {
                    if (!err && userData) {
                        // Remove the password before sending to the user
                        delete userData.password;
                        callback(200, userData);
                    } else {
                        callback(404, {
                            'status': 'fail',
                            'message': 'User with this email does not exist\'s'
                        });
                    }
                });
            } else {
                callback(403, {
                    'status': 'fail',
                    'message': 'Token is missing or invalid'
                })
            }
        })
    } else {
        callback(400, {
            'status': 'fail',
            'message': 'Missing required feild'
        })
    }
}

// POST
// Required data: name, email, address
// Optional data: none
users.post = function (data, callback) {
    // Validate fields
    const email = typeof (data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    const name = typeof (data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
    const address = typeof (data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (name && email && address && password) {

        // Check if the user already exist
        storeHelper.read('users', email, function (err, data) {
            if (err) {

                // Create user object
                const userData = {
                    name: name,
                    email: email,
                    address: address,
                    password: helpers.hash(password) // hash the password before storing
                };

                // Store the user data 
                storeHelper.create(dir, email, userData, function (err) {
                    if (!err) {
                        callback(200, {
                            'status': 'ok',
                            'message': 'User created successfully'
                        });
                    } else {
                        callback(500, {
                            'status': 'fail',
                            'message': err
                        });
                    }
                });
            } else {
                callback(400, {
                    'status': 'fail',
                    'message': 'User with this email already exist\'s'
                });
            }
        })
    } else {
        callback(400, {
            'status': 'fail',
            'message': 'Missing required fields'
        });
    }
}

// PUT
// Required data: email
// Optional data: name, email, address
users.put = function (data, callback) {
    // Validate fields
    const email = typeof (data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;

    // Check for the field optional fields
    const name = typeof (data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
    const address = typeof (data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;

    if (email && (name || address)) {
        // Get the token
        const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

        tokens.verifyToken(tokenId, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // Lookup  the user
                storeHelper.read(dir, email, function (err, userData) {
                    // check if the user was found
                    if (!err && userData) {
                        // update the user object with the provided data
                        if (name) {
                            userData.name = name;
                        }

                        if (address) {
                            userData.address = address;
                        }
                        // Store the updated object 
                        storeHelper.update(dir, email, userData, function (err) {
                            if (!err) {
                                callback(200, {
                                    'status': 'ok',
                                    'message': 'User details successfully updated'
                                });
                            } else {
                                callback(500, {
                                    'status': 'fail',
                                    'message': 'Error in updating file'
                                })
                            }
                        });

                    } else {
                        callback(404, {
                            'status': 'fail',
                            'message': 'User with this email does not exist\'s'
                        });
                    }
                });
            } else {
                callback(403, {
                    'status': 'fail',
                    'message': 'Missing token or it\'s is invalid'
                })
            }
        });
    } else {
        callback(400, {
            'status': 'fail',
            'message': 'Missing required fields'
        });
    }
}

// DELETE
// Required data: email
// Optional data: none
// @TODO:delete user related data
users.delete = function (data, callback) {
    // Validate fields
    const email = typeof (data.queryString.email) == 'string' && data.queryString.email.trim().length > 0 ? data.queryString.email.trim() : false;

    if (email) {
        // Get the token from header
        const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

        // verify token
        tokens.verifyToken(tokenId, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // Lookup user
                storeHelper.read(dir, email, function (err, userData) {
                    if (!err && userData) {
                        storeHelper.delete(dir, email, function (err) {
                            if (!err) {
                                callback(200, {
                                    'status': 'ok',
                                    'message': 'User successfully deleted'
                                });
                            } else {
                                callback(500, {
                                    'status': 'fail',
                                    'message': 'Could not delete the specified user'
                                });
                            }
                        })
                    } else {
                        callback(404, {
                            'status': 'fail',
                            'message': 'User with this email does not exist\'s'
                        });
                    }
                });
            } else {
                callback(403, {
                    'status': 'fail',
                    'message': 'Missing token or it\'s is invalid'
                })
            }
        }) 
    } else {
        callback(400, {
            'status': 'fail',
            'message': 'Missing required feild'
        });
    }
}

// Export
module.exports = users;