module.exports = function(resp){
    var self = this;

    this.write = function(content){
        resp.writeHead(
            200,
            {
                'Content-Type': 'text/plain',
            }
        );
        resp.end(content);
    };

    this.error = function(){
        resp.end('Here is ORICHALCUM.CORE, your command have not been recognized yet.');
    };
};
