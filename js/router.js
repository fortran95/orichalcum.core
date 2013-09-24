module.exports = function(e){
    var breaked = e.request.url.split('/');
    switch(breaked[1].toLowerCase()){
        case 'service':
            x.service.command(e, breaked.slice(2))
            break;
        case 'interface':
            x.interface.command(e, breaked.slice(2).join('/'));
            break;
        default:
            e.output.redirectPermanent(
                x.string.url.resolve(
                    'interface/',
                    breaked.slice(1).join('/')
                )
            );
            break;
    }
};
