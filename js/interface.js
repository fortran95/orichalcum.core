module.exports = {

    command: function(e, url){
        var parsedURL = x.string.url.parse(url);
        e.output.write(parsedURL.pathname);
    },

};
