module.exports = {
    command: function(e, cmds){
        if(cmds[0] == undefined){
            e.output.error();
            return;
        }

        var jidInput = cmds[0].trim().split('@');
        var jid = new x.communication_modules.xmpp.JID(
            jidInput[0],
            jidInput[1]
        ).bare().toString();

        this.manage(e, jid, cmds.slice(1));
    },

    manage: function(e, jid, cmds){
        var manageTarget = x.service.list.xmpp[jid];

        if(cmds[0] == undefined){
            e.output.write('HIT a client. Here shall be the overview.');
            return;
        }

        if(manageTarget == undefined){
            manageTarget = new this.factory(jid);
            x.service.list.xmpp[jid] = manageTarget;
        }

        switch(cmds[0].toLowerCase()){
            case 'login':
                if(e.request.method == 'POST'){
                    function sequence(){
                        var pwd = e.request.parsedFullContent.password;
                        manageTarget.login(pwd);
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

    factory: function(jid){
        return {

            client: null,
            
            login: function(password){
                this.client =
                    new x.communication_modules.xmpp.Client({
                        jid: jid,
                        password: password,
                    })
                ;
                this.client.on('online', this.handlers.onOnline);
                this.client.on('stanza', this.handlers.onStanza);
                console.log('Login using [' + jid + '] with password [' + password + ']');
            },

            handlers: {

                onOnline: function(){
                    console.log('[' + jid + ']XMPP Online. Sending Presence.');
                    var me = x.service.list.xmpp[jid];
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
                    var me = x.service.list.xmpp[jid];
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

            }, // handlers: ...

        }; // return ..

    },  // factory: ...
}
