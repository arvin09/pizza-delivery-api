/**
 * All helper functions
 */

// Dependeicies
const crypto = require('crypto');
const config = require('./config');
const querystring = require('querystring');
const https = require('https');

// Container for the helper
const helpers = {};


// Parse a Json to an object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

// Create a SHA256 hash
helpers.hash = function (str) {
    if (typeof (str) == 'string' && str.trim().length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Generate random string of a given length
helpers.createRandomString = function (strLength) {
    if (typeof (strLength) == 'number' && strLength > 0) {
        // Possible characters
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        // Generate the string
        var str = '';
        for (let i = 1; i <= strLength; i++) {
            let randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
            str += randomChar;
        }
        return str;
    } else {
        return false;
    }
}

// use the details to send to stripe API to charge the given card
helpers.createCharge = function (amount, currency, card, description, callback) {
    // Validate Fields
    const _amount = typeof (amount) == 'number' && amount > 0 ? amount : false;
    const _currency = typeof (currency) == 'string' && currency.trim().length > 0 ? currency.trim() : false;
    const _description = typeof (description) == 'string' && description.trim().length > 0 ? description.trim() : false;
    const _card = typeof (card) == 'string' && card.trim().length > 0 ? card.trim().toLowerCase() : 'tok_visa';

    if (_amount && _currency) {
        const payload = {
            amount: _amount,
            currency: _currency,
            card: _card,
            description: _description
        }

        // Stringyfy the payload
        const stringPayload = querystring.stringify(payload);

        // Configure the request
        var requestDetails = {
            'protocol': 'https:',
            'hostname': config.stripe.host,
            'method': 'POST',
            'path': config.stripe.path,
            'body': stringPayload,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(config.stripe.secret).toString('base64')
            }
        }

        // Instantiate the request object
        var req = https.request(requestDetails, function (res) {
            // Grab the status code of the sent request
            var status = res.statusCode;
            // Callback sucessfull if the request went through
            if (status == 200 || status == 201) {
                callback(false);
            } else {
                callback('Status code returned was ' + status);
            }
        })

        // Bind to the error event so that it does not get thrown
        req.on('error', function (e) {
            callback(e)
        });

        // Add the payload to tbe request
        req.write(stringPayload);

        // End the request
        req.end();

    } else {
        callback('Given parameters are missing or invalid');
    }
}

// use the details to send to email from mailgun api
helpers.sendEmail = function (email, subject, body,callback) {
    // Validate all the fields
    const _email    = typeof(email) == 'string' && email.trim().length > 0 ? email.trim() : false;
    const _subject  = typeof(subject) == 'string' && subject.trim().length > 0 ? subject.trim() : false;
    const _body     = typeof(body) == 'string' && body.trim().length > 0 ? body.trim() : false;

    if(_email && _subject && _body) {

        const payload = {
            from : config.mailgun.from,
            to: _email,
            subject: _subject,
            text: _body 
        }

        // Stringyfy the payload
        const stringPayload = querystring.stringify(payload);

        // Configure the request
        var requestDetails = {
            'protocol': 'https:',
            'hostname': config.mailgun.host,
            'method': 'POST',
            'path': config.mailgun.path,
            'body': stringPayload,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from('api:' + config.mailgun.secret).toString('base64')
            }
        }

        // Instantiate the request object
        var req = https.request(requestDetails, function (res) {
            // Grab the status code of the sent request
            var status = res.statusCode;
            // Callback sucessfull if the request went through
            if (status == 200 || status == 201) {
                callback(false);
            } else {
                callback('Status code returned was ' + status);
            }
        })

        // Bind to the error event so that it does not get thrown
        req.on('error', function (e) {
            callback(e)
        });

        // Add the payload to tbe request
        req.write(stringPayload);

        // End the request
        req.end();

    } else {
        callback(true, 'Missing required fields');
    }

}
// Validate email
helpers.validateEmail = function (email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}

module.exports = helpers