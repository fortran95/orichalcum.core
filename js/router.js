module.exports = function(e){
    var parsedURL = x.string.url.parse(e.request.url);
    var breaked = parsedURL.pathname.split('/');
    switch(breaked[1].toLowerCase()){
        case 'service':
            x.service.command(e, breaked.slice(2))
            break;
        case 'interface':
            x.interface.command(e, breaked.slice(2).join('/'));
            break;
        default:
            e.output.redirectPermanent(
                '/interface/' +
                breaked.slice(1).join('/') +
                parsedURL.search
            );
            break;
    }
};
