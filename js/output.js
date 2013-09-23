module.exports = {
    write: function(resp, content){
        resp.end(content);
    },

    error: function(resp){
        resp.end('Here is ORICHALCUM.CORE, your command have not been recognized yet.');
    }
}
