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
                        var result = manageTarget.login(pwd);
                        if(result)
                            e.output.w202('Asked client to login.');
                        else
                            e.output.w406('Client refused to login.');
                    }
                    e.onPosted(sequence);
                } else
                    e.output.error();
                break;
            case 'logout':
                manageTarget.logout();
                e.output.w202('Asked Client to logout.');
                break;
            default:
                e.output.w200(
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
        
        this.clientStatus = function(v){
            /* see <https://github.com/astro/node-xmpp/blob/master/lib/xmpp/client.js> */
            var res = 'PREAUTH';
            if(self.client)
                res = {
                    0: 'PREAUTH',
                    1: 'AUTH',
                    2: 'AUTHED',
                    3: 'BIND',
                    4: 'SESSION',
                    5: 'ONLINE',
                }[self.client.state];

            if(v == undefined)
                return res;
            else
                return res == v || self.client.state == v;
        };

        this.loggedIn = function(){
            if(self.client)
                return self.client.state >= 2;
            return false;
        };

        this.logout = function(){
            if(!self.loggedIn()) return;
            self.client.end();
        };

        this.login = function(password){
            if(self.loggedIn() || password == undefined) return false;

            self.client =
                new x.communication_modules.xmpp.Client({
                    jid: jid,
                    password: password,
                })
            ;
            self.client.on('online', self.handlers.onOnline);
            self.client.on('stanza', self.handlers.onStanza);
            self.client.on('error', self.handlers.onError);

            return true;
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
                if(self.clientStatus('AUTH')){
                    // Login failure. Attach self destory sequence.
                    self.client.on(
                        'close',
                        function(){
                            self.client = null;
                            console.log('SELF DESTORYED.');
                        }
                    );
                    console.log('Detected failed login. End connection.');
                    self.client.end();
                }
            },
        }; // handlers: ...
    },  // factory: ...


}
