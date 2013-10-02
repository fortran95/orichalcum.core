module.exports = {
    command: function(e, cmds){
        var barJID = null;
        if(cmds[0] != undefined)
            barJID = cmds[0].trim();

        if(barJID){
            // TODO verify jid, if not valid, do not call 'manage'.
            var jid = new x.communication_modules.xmpp.JID(
                barJID
            ).bare().toString();
            this.manage(e, jid, cmds.slice(1));
        } else {
            var report = {};
            for(var jid in x.service.list.xmpp)
                report[jid] = x.service.list.xmpp[jid].report();
            e.output.w200(JSON.stringify(report));
        }

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
                    e.onPosted(function(){
                        var pwd = e.request.parsedFullContent.password;
                        var result = manageTarget.login(pwd);
                        if(result)
                            e.output.w202('Asked client to login.');
                        else
                            e.output.w406('Client refused to login.');
                    });
                } else
                    e.output.error();
                break;
            case 'logout':
                manageTarget.logout();
                e.output.w202('Asked Client to logout.');
                break;
            case 'kill':
                manageTarget.kill();
                e.output.w202('Killed client.');
                break;
            case 'send':
                if(e.request.method == 'POST'){
                    var receiptJID = cmds[1];
                    e.onPosted(function(){
                        var content = e.request.parsedFullContent.content;
                        var result = manageTarget.send(receiptJID, content);
                        if(result){
                            e.output.w202('Message recorded and sending.');
                        } else {
                            e.output.w406('Client refused to send.');
                        }
                    });
                } else
                    e.output.error();
                break;
            case 'ping':
                var receipt = cmds[1];
                var result = manageTarget.ping(receipt);
                if(result){
                    e.output.w202('Client agreed to ping.');
                } else {
                    e.output.w406('Client refused to ping.');
                }
                break;
            default:
                e.output.w200(
                    JSON.stringify(manageTarget.report())
                );
                break;
        }

    },

    factory: function(jid){
        var self = this;

        this.client = null;

        this.queue = new x.storage.queue();
        
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

        this.report = function(){
            return {
                'jid': jid,
                'client': {
                    'status': self.clientStatus(),
                },
                'queue': {
                    'send': self.queue.countSend(),
                    'receive': self.queue.countReceive(),
                },
            };
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

        this.kill = function(){
            try{
                if(self.client)
                    self.client.connection.socket.destroy();
                delete self.client;
            } finally {
            }
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
            self.client.on('close', self.handlers.onClose);
            
            self.client.connection.socket.setTimeout(
                10000,
                self.handlers.onTimeout
            );

            return true;
        };

        this.send = function(jid, content){
            if(!self.loggedIn()) return false;
            if(content == undefined) return false;
            x.log.notice('Sending to [' + jid + ']: ' + content);
            self.client.send(
                new x.communication_modules.xmpp.Element(
                    'message',
                    {
                        to: jid,
                        type: 'chat'
                    }
                )
                    .c('body')
                    .t(content)
            );
            return true;
        };

        this.ping = function(jid){
            var stanzaID = '';
            if(!self.loggedIn()) return false;

            if(jid == undefined){
                jid = self.client.jid.bare();
                stanzaID = 'c2s1';
            } else {
                stanzaID = 'e2e1';
            }

            var stanza = new x.communication_modules.xmpp.Element(
                'iq',
                {
                    from: self.client.jid,
                    to: jid,
                    type: 'get',
                    id: stanzaID,
                }
            )
                .c('ping')
                .attr('xmlns', 'urn:xmpp:ping')
                .root()
            ;

            x.log.debug(stanza.toString());

            self.client.send(stanza);

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
                    stanza.attrs.type !== 'error' 
                ){
                    var body = stanza.getChild('body');
                    if(body != undefined){
                        var newMessage = {
                            'content': body.children.join(''),
                            'from': stanza.attrs.from,
                        };
                        x.log.notice(newMessage);
                        self.queue.receive(newMessage);
                    }
                }

                x.log.notice(stanza.root().toString());
            },

            onError: function(e){
                x.log.notice(e);
                if(self.clientStatus('AUTH')){
                    // Login failure. Attach self destory sequence.
                    self.client.on(
                        'close',
                        function(){
                            self.client = null;
                            x.log.notice('SELF DESTORYED.');
                        }
                    );
                    x.log.notice('Detected failed login. End connection.');
                    self.client.end();
                }
            },

            onTimeout: function(e){
//                self.kill();
//                x.log.notice('Detected timeout. Self destroyed.');
                x.log.notice('Timeout received.');
            },

            onClose: function(e){
                x.log.notice('Close received.');
            },


        }; // handlers: ...
    },  // factory: ...


}
