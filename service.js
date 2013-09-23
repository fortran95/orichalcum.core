var queue = {
    send: [],
    receive: [],
};

var services = [];


var server = {

    _server: null,

    init: function(){
        server._server = require('http').createServer();
        server._server.on(
            'request',
            server.handlers.onRequest
        );
        server._server.listen(8000);
    },

    handlers: {
        onRequest: function (request, response){
            response.end(request.url);
        },
    },

};

server.init();
