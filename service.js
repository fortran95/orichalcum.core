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
            server.router(server.createPackage(request, response));
        },
    },

    router: require('./js/router.js'),

    createPackage: function(request, response){
        request.fullContent = '';
        request.on('data', function(chunk){
            request.fullContent += chunk;
            console.log(request.fullContent);
        });

        return {
            request: request,
            response: response,
            output: x.io.output.outputCreator(response),
        };
    },

};

server.init();
