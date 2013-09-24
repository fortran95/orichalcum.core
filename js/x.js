var _x_ = {

    nodejs: {

        events: require('events'),

    },
    
    storage: {

        queue: require('./queue.js'),

    },

    io: {

        output: require('./output.js'),
        fileSystem: require('fs'),

    },

    crypto: {

        uuid: require('./uuid.js'),

    },

    service: require('./service.js'),
    interface: require('./interface.js'),

    string: {

        query: require('querystring'),
        url: require('url'),
        path: require('path'),

    },

    communication_modules: {

        xmpp: require('node-xmpp'),

    },

};

module.exports = _x_;
