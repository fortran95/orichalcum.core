module.exports = function(request, response){
    var breaked = request.url.split('/');
    switch(breaked[1].toLowerCase()){
        case 'xmpp-add':
            x.storage.queue.send('a', 'b');
            x.io.output.write(response, 'ok');
            break;
        default:
            x.io.output.error(response);
            break;
    }
};
