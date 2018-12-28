/**
 *  store and retrive data
 */

// Dependencies 
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Instantitate the store
const store = {};

// Base Path for storing the files
store.baseDir = path.join(__dirname, '/../.data/');

// Read file
store.read = function (dir, file, callback) {
    fs.readFile(store.baseDir + dir + '/' + file + '.json', 'utf8', function (err, data) {
        if (!err) {
            var parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data)
        }
    })
}

// Create a new file
store.create = function (dir, file, data, callback) {
    fs.open(store.baseDir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            // Convert data to string data
            const stringData = JSON.stringify(data);

            fs.writeFile(fileDescriptor, stringData, function (err) {
                if (!err) {
                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error in closing file');
                        }
                    })
                } else {
                    callback('Error in writinfg to the file');
                }
            });
        } else {
            callback('Error in creating file might be already exisiting');
        }
    });
}

// Update file
store.update = function (dir, file, data, callback) {
    // Open the file for read and write 
    fs.open(store.baseDir + dir + '/' + file + '.json', 'r+', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            // Convert data to string data
            const stringData = JSON.stringify(data);

            // Truncate the file
            fs.truncate(fileDescriptor, function(err) {
                if(!err) {
                    fs.writeFile(fileDescriptor, stringData, function (err) {
                        if (!err) {
                            fs.close(fileDescriptor, function (err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error in closing existing file');
                                }
                            })
                        } else {
                            callback('Error in writinfg to existing the file');
                        }
                    });
                } else {
                    callback('Error in truncating existing file')
                }
            })
        } else {
            callback('Could not open the file for updating, it may not exist yet'+ err);
        }
    });
}

// Delete the file
store.delete = function(dir, file, callback) {
    // deltet/unlink the file from fs
    fs.unlink(store.baseDir + dir + '/' + file + '.json', function(err) {
        if(!err) {
            callback(false);
        } else {
            callback('Error in deleting the file')
        }
    })
}

// List all the items ina directory
store.list = function(dir, callback) {
    fs.readdir(store.baseDir + dir +'/', function(err, data) {
        if(!err && data && data.length) {
            var trimmedFileNames = [];
            data.forEach(function(fileName) {
                trimmedFileNames.push(fileName.replace('.json',''));
            });
            callback(false, trimmedFileNames)
        } else {
            callback(err);
        }
    });
}


// Export data
module.exports = store;