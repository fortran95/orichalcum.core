x = require('./js/x.js');

var server = {

    _server: null,

    init: function(){
        server._server = require('http').createServer(
            server.handlers.onRequest
        );
        server._server.listen(8000);
    },

    handlers: {
        onRequest: function (request, response){
            console.log('Request: ' + request.url);
            server.router(request, response);
        },
    },

    router: require('./js/router.js'),

};

server.init();
