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

    object: {
        getter: function(from, what, iffail){
            if(iffail == undefined) iffail = false;
            if(from[what] == undefined)
                return iffail;
            else
                return from[what];
        },
    },

    communication_modules: {

        xmpp: require('node-xmpp'),

    },

    log: require('./log.js'),

};

module.exports = _x_;
