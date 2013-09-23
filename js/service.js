function xmpp(uuid){
    return {
        
        login: function(jid, password){
        },

    }
}

module.exports = {

    list: {
        xmpp: {},
    },

    command: function(e, cmds){
        if(cmds[0] == undefined)
            e.output.error();

        switch(cmds[0].toLowerCase()){
            case 'xmpp':
                this.xmpp.command(e, cmds.slice(1));
                break;
            default:
                e.output.error();
                break;
        }
    },

    xmpp: {
        
        command: function(e, cmds){
            if(cmds[0] == undefined)
                e.output.error();

            switch(cmds[0].toLowerCase()){
                case 'add':
                    var newuuid = x.crypto.uuid();
                    x.service.list.xmpp[newuuid] = xmpp(newuuid);
                    e.output.write(newuuid);
                    break;
                case 'login':
                    break;
                default:
                    if(x.service.list.xmpp[cmds[0]] != undefined){
                        e.output.write('Hit');
                    } else
                        e.output.error();
                    break;
            }
        },

    },

}
