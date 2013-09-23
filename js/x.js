var _x_ = {
    
    storage: {

        queue: require('./queue.js'),

    },

    io: {

        output: require('./output.js'),

    },

    crypto: {

        uuid: require('./uuid.js'),

    },

    service: require('./service.js'),

    string: {

        query: require('querystring'),

    },

    communication_modules: {

        xmpp: require('node-xmpp'),

    },

};

module.exports = _x_;
