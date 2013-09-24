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
        request.parsedFullContent = null;

        if(request.method == 'POST'){
            request.on('data', function(chunk){
                request.fullContent += chunk;
                if(request.fullContent.length > 102400)
                    request.connection.destory();
            });
            request.on('end', function(){
                request.parsedFullContent = 
                    x.string.query.parse(request.fullContent);
            });
        }

        return {
            request: request,
            response: response,
            output: new x.io.output(response),
            
            onPosted: function(callback){
                if(request.parsedFullContent != null)
                    callback();
                else
                    request.on('end', callback);
            },
        };
    },

};

server.init();
