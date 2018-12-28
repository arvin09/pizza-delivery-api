/**
 * Menus route handlers
 */

// Dependencies
const storeHelper = require('../libs/store');
const tokens = require('../routes/tokens');

// Instantiate menus
const menus = {};

// GET
// Required fields: email, token
// Optional fields: none 
menus.get = function (data, callback) {

    // Validate required fields
    const email = typeof (data.headers.email) == 'string' && data.headers.email.trim().length > 0 ? data.headers.email.trim() : false;
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

    if (email && tokenId) {
        // validate the token
        tokens.verifyToken(tokenId, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the menu
                storeHelper.read('menus', 'menus', function (err, menuData) {
                    if (!err && menuData) {
                        callback(200, menuData);
                    } else {
                        callback(404, {
                            'status': 'fail',
                            'message': 'Could not find provided token or it has expired'
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
        callback(404, {
            'status': 'fail',
            'message': 'Missing required fields'
        });
    }
}

menus.getSelectedMenuItems = function (menusItems, callback) {
    let isValidMenuItems = false;
    let selectedMenuItems = [];
    storeHelper.read('menus', 'menus', function (err, menuData) {
        if (!err && menuData) {
            var menuItems = menuData.items;
            menusItems.forEach(function (menuItem) {
               for(let i=0; i < menuItems.length; i ++){
                    if (menuItems[i].id == menuItem.id) {
                        menuItems[i].quantity = menuItem.quantity;
                        menuItem.price = menuItems[i].price
                        selectedMenuItems.push(menuItems[i]);
                        break;
                    } 
                };
            });
            callback(!(selectedMenuItems.length === menusItems.length), selectedMenuItems);
        } else {
            callback(true, null);
        }
    });
}

// Export token
module.exports = menus