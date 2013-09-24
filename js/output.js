module.exports = {

    outputCreator: function(resp){
        return {
            write: function(content){
                resp.writeHead(
                    200,
                    {
                        'Content-Type': 'text/plain',
                    }
                );
                resp.end(content);
            },

            error: function(){
                resp.end('Here is ORICHALCUM.CORE, your command have not been recognized yet.');
            }
        }
    },

}
