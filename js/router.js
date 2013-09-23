module.exports = function(e){
    var breaked = e.request.url.split('/');
    switch(breaked[1].toLowerCase()){
        case 'service':
            x.service.command(e, breaked.slice(2))
            break;
        default:
            x.io.output.error(e);
            break;
    }
};
