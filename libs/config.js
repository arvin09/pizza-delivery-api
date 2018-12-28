/**
 *  Application configuration
 */

// @TODO: create environment based config
// Container
var config = {
    'httpPort': 9090,
    'httpsPort': 5000,
    'hashingSecret': 'SceretPassword',
    'stripe': {
        'secret': 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
        'host': 'api.stripe.com',
        'path': '/v1/charges'
    },
    'mailgun': {
        'secret': 'YOUR_MAILGUN_PRIVATE_KEY',
        'host': 'api.mailgun.net',
        'path': '/v3/sandbox9970f853809342c684b8b9e1a2db4818.mailgun.org/messages',
        'from': 'arvin09@gmail.com'
    }
};




// Export the module
module.exports = config;