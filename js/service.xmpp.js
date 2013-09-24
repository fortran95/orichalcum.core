module.exports = {
    command: function(e, cmds){
        if(cmds[0] == undefined){
            e.output.error();
            return;
        }

        var jid = new x.communication_modules.xmpp.JID(
            cmds[0].trim()
        ).bare().toString();

        // TODO verify jid, if not valid, do not call 'manage'.

        this.manage(e, jid, cmds.slice(1));
    },

    manage: function(e, jid, cmds){
        var manageTarget = x.service.list.xmpp[jid];
        var operand = cmds[0];
        if(operand)
            operand = operand.toLowerCase();
        else
            operand = '';

        if(manageTarget == undefined){
            manageTarget = new this.factory(jid);
            x.service.list.xmpp[jid] = manageTarget;
        }

        switch(operand){
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
                e.output.write(
                    JSON.stringify({
                        'jid': jid,
                        'client': {
                            'status': manageTarget.clientStatus(),
                        },
                    })
                );
                break;
        }

    },

    factory: function(jid){
        var self = this;

        this.client = null;
        
        this.clientStatus = function(){
            /* see <https://github.com/astro/node-xmpp/blob/master/lib/xmpp/client.js> */
            if(self.client)
                return {
                    0: 'PREAUTH',
                    1: 'AUTH',
                    2: 'AUTHED',
                    3: 'BIND',
                    4: 'SESSION',
                    5: 'ONLINE',
                }[self.client.state];
            else
                return 'PREAUTH';
        };
            
        this.login = function(password){
            self.client =
                new x.communication_modules.xmpp.Client({
                    jid: jid,
                    password: password,
                })
            ;
            self.client.on('online', self.handlers.onOnline);
            self.client.on('stanza', self.handlers.onStanza);
            self.client.on('error', self.handlers.onError);
        };

        this.handlers = {

            onOnline: function(){
                self.client
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
                if(
                    stanza.is('message') &&
                    stanza.attrs.type !== 'error'   // Important: never reply to errors!
                ){
                    var body = stanza.getChild('body');
                    if(body != undefined)
                        console.log(body.children.join(''));
                    // Swap addresses...
                    stanza.attrs.to = stanza.attrs.from;
                    delete stanza.attrs.from;
                    // and send back.
                    self.client.send(stanza);
                }
            },

            onError: function(e){
                console.log(e);
            },
        }; // handlers: ...
    },  // factory: ...


}
