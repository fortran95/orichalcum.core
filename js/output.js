module.exports = function(resp){
    var self = this;

    this.write = function(content, httpCode, options){
        if(httpCode == undefined) httpCode = 200;

        resp.writeHead(
            httpCode,
            options
        );
        resp.end(content);
    };

    this.error = function(){
        resp.end('Here is ORICHALCUM.CORE, your command have not been recognized yet.');
    };

    this.w200 = function(content, options){
        self.write(content, 200, options);
    };

    this.w200html = function(content){
        self.write(content, 200, {'Content-Type': 'text/html'});
    };

    this.w200text = function(content){
        self.write(content, 200, {'Content-Type': 'text/plain'});
    };

    this.redirectPermanent = function(destination){
        resp.writeHead(307, {'Location': destination});
        resp.end();
    };
};
