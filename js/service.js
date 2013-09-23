function xmpp(uuid){
    return {

        client: null,
        
        login: function(jid, password){
            this.client =
                new x.communication_modules.xmpp.Client({
                    jid: jid,
                    password: password,
                })
            ;
            this.client.on('online', this.handlers.onOnline);
            this.client.on('stanza', this.handlers.onStanza);
        },

        handlers: {

            onOnline: function(){
                var me = x.service.list.xmpp[uuid];
                me.client
                    .send(
                        new x.communication_modules.xmpp
                            .Element('presence', { })
                            .c('show')
                            .t('chat')
                            .up()
                            .c('status')
                            .t('THIS IS THE ECHOBOT FROM ORICHALCUM.CORE!')
                    )
                ;
            },

            onStanza: function(stanza){
                var me = x.service.list.xmpp[uuid];
                if(
                    stanza.is('message') &&
                    stanza.attrs.type !== 'error'   // Important: never reply to errors!
                ){
                    // Swap addresses...
                    stanza.attrs.to = stanza.attrs.from;
                    delete stanza.attrs.from;
                    // and send back.
                    me.client.send(stanza);
                }
            }

        },

    }
}

module.exports = {

    list: {
        xmpp: {},
    },

    command: function(e, cmds){
        if(cmds[0] == undefined){
            e.output.error();
            return;
        }

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
            if(cmds[0] == undefined){
                e.output.error();
                return;
            }

            switch(cmds[0].toLowerCase()){
                case 'add':
                    var newuuid = x.crypto.uuid();
                    x.service.list.xmpp[newuuid] = new xmpp(newuuid);
                    e.output.write(newuuid);
                    break;
                default:
                    if(x.service.list.xmpp[cmds[0]] != undefined){
                        this.manage(e, cmds[0], cmds.slice(1));
                    } else
                        e.output.error();
                    break;
            }
        },

        manage: function(e, uuid, cmds){
            var manageTarget = x.service.list.xmpp[uuid];
            if(cmds[0] == undefined){
                e.output.write('HIT a client. Here shall be the overview.');
                return;
            }

            switch(cmds[0].toLowerCase()){
                case 'login':
                    if(e.request.method == 'POST'){
                        function sequence(){
                            var jid = e.request.parsedFullContent.jid;
                            var pwd = e.request.parsedFullContent.password;
                            manageTarget.login(jid, pwd);
                            e.output.write('Asked client to login.');
                        }
                        e.onPosted(sequence);
                    } else
                        e.output.error();
                    break;
                default:
                    break;
            }
        },

    },

}
