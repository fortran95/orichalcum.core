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
            //TODO unrecognized query redirect to /interface.
            e.output.error();
            break;
    }
};
