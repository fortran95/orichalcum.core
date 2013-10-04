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
                     e.output.w200json(manageTarget.send());
                break;
            case 'receive':
                 e.output.w200json(manageTarget.receive());
                break;
            case 'roster':
                e.output.w200json(manageTarget.roster());
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

        this._autoReconnect = false;
        this._password = false;
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
            var password = false;
            if(self.password) password = true;

            return {
                'jid': jid,
                'client': {
                    'status': self.clientStatus(),
                    'password': password,
                },
                'queue': {
                    'send': self.queue.countSend(),
                    'receive': self.queue.countReceive(),
                },
                'roster': self.roster(),
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
            self._autoReconnect = false;
        };

        this.kill = function(){
            /*
             * Forced Restart Sequence
             *
             * This will destory the client, and try to login.
             */
            try{
                if(self.client){
                    self.client.connection.socket.destroy();
                    delete self.client;

                    if(self._autoReconnect){
                        self.login(self._password);
                    }
                }
            } finally {
            }
        };

        this.login = function(password){
            if(self.clientStatus() > 0) return false;
            if(password == undefined) password = self._password;
            if(!password) return false;

            self.client =
                new x.communication_modules.xmpp.Client({
                    jid: jid,
                    password: password,
                })
            ;
            self._autoReconnect = true;
            self._password = password;

            self.client.on('online', self.handlers.onOnline);
            self.client.on('stanza', self.handlers.onStanza);
            self.client.on('error', self.handlers.onError);
            self.client.on('close', self.handlers.onClose);

            self.client.connection.socket.setTimeout(
                10000,
                self.handlers.onTimeout
            );

            self.watchdog.wake();
            self.autoPinger();

            return true;
        };

        this.send = function(jid, content){
            if(jid == undefined){
                // Get send queue
                return self.queue.send();
            } else {
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
            }
        };

        this.receive = function(){
            // Get receive queue
            if(!self.loggedIn()) return false;
            return self.queue.receive();
        };

        this.roster = function(){
            return self.rosterManager.all();
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

        this.autoPinger = function(){
            /*
             * Once called, will use setTimeout to generate PING every 20 sec.
             */
            self.ping();// to Server

            if(self.client)
                setTimeout(self.autoPinger, 20000);
        };

        this.sendPresence = function(show, words){
            if(!self.loggedIn()) return false;
            if(show == undefined) show = 'chat';
            if(words == undefined) words = 'A probe of my orichalcum system.';

            self.client
                .send(
                    new x.communication_modules.xmpp
                        .Element('presence', { })
                        .c('show')
                        .t(show)
                        .up()
                        .c('status')
                        .t(words)
                )
            ;
        };

        this.handlers = {

            onOnline: function(){
                self.client
                    .send(
                        new x.communication_modules.xmpp.Element(
                            'iq', {
                                from: self.client.jid,
                                type: 'get',
                                id: 'roster_1',
                            }
                        )
                            .c('query')
                            .attr('xmlns', 'jabber:iq:roster')
                            .root()
                    )
                ;
            },

            onStanza: function(stanza){
                self.watchdog.feed();

                /*
                 * Use self.xmppParser to parse stanza.
                 * Here is the router.
                 */
                if(
                    stanza.is('message') &&
                    stanza.attrs.type !== 'error'
                )
                    self.xmppParser.message(stanza);

                if(stanza.is('iq')){
                    if(
                        stanza.attrs.type == 'result' &&
                        stanza.attrs.id == 'roster_1'
                    )
                        self.xmppParser.roster(stanza);
                }
                /* end of router */

                x.log.notice(stanza.root().toString());
            },

            onError: function(e){
                x.log.notice(e);
                if(self.clientStatus('AUTH')){
                    // failure to login.
                    if(e.toString().indexOf('auth') >= 0){
                        // Login failure.
                        self._password = false;
                        self._autoReconnect = false;
                    }
                    // Attach self destory sequence.
                    self.kill();
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

        this.watchdog = {

            _lastTime: 0,
            patience: 30000,

            wake: function(){
                self.watchdog.feed();
                self.watchdog.hungry();
            },

            feed: function(){
                self.watchdog._lastTime = new Date().getTime();
            },

            hungry: function(){
                var nowtime = new Date().getTime();
                if(nowtime - self.watchdog._lastTime > self.watchdog.patience)
                    if(self.loggedIn()){
                        self.kill();
                        x.log.notice('Watchdog shutdown client!');
                    }

                if(self.client)
                    setTimeout(self.watchdog.hungry, 1000);
            },

        }

        this.xmppParser = {

            message: function(stanza){
                var body = stanza.getChild('body');
                if(body != undefined){
                    var newMessage = {
                        'content': body.children.join(''),
                        'from': stanza.attrs.from,
                    };
                    x.log.notice(newMessage);
                    self.queue.receive(newMessage);
                }
            },

            roster: function(stanza){
            },

        };

        this.rosterManager = {
            
            _roster: {'debug':{'test@test.org':{'status':'online'}, 'abc@cde.com':{'status':'offline'}}},

            register: function(list){
            },

            presence: function(){
                
            },

            all: function(){
                return self.rosterManager._roster;
            },

        };
    },  // factory: ...


}
