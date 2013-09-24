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

    this._endCode = function(code){
        resp.writeHead(code);
        resp.end();
    };

    this.w200 = function(content, options){
        self.write(content, 200, options);
    };

    this.w200html = function(content){
        self.w200(content, {'Content-Type': 'text/html'});
    };

    this.w200text = function(content){
        self.w200(content, {'Content-Type': 'text/plain'});
    };

    this.w404 = function(){self._endCode(404);};
    this.w401 = function(){self._endCode(401);};

    this.redirectPermanent = function(destination){
        resp.writeHead(301, {'Location': destination});
        resp.end();
    };
};
