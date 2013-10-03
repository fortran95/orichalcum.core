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

    this._endCode = function(code, content){
        resp.writeHead(code);
        resp.end(content);
    };

    this.w200 = function(content, options){
        self.write(content, 200, options);
    };

    this.w202 = function(content){
        self.write(content, 202);
    };

    this.w200html = function(content){
        self.w200(content, {'Content-Type': 'text/html'});
    };

    this.w200text = function(content){
        self.w200(content, {'Content-Type': 'text/plain'});
    };

    this.w200json = function(json){
        self.w200(JSON.stringify(json), {'Content-Type': 'text/plain'});
    };

    this.w404 = function(c){self._endCode(404, c);};
    this.w401 = function(c){self._endCode(401, c);};
    this.w406 = function(c){self._endCode(406, c);};

    this.redirectPermanent = function(destination){
        resp.writeHead(301, {'Location': destination});
        resp.end();
    };
};
