var functions = {

    xmpp: {
        login: function(jid, pwd){
            $.ajax({
                type: "POST",
                url: '/service/xmpp/' + jid + '/login',
                data: {password: pwd},
                success: function(e){
                    
                },
                dataType: 'text',
            });
        },

        logout: function(jid){
            $.ajax({
                type: "GET",
                url: '/service/xmpp/' + jid + '/logout',
                success: function(e){
                    
                },
                dataType: 'text',
            });
        },

        send: function(senderJID, receiverJID, message){
            $.ajax({
                type: "POST",
                url: '/service/xmpp/' + senderJID + '/send/' + receiverJID,
                data: {content: message},
                success: function(e){},
                dataType: 'text',
            });
        },
    },

};

var xmppPanel = function(){
    var self = this;

    this.display = {

        refresh: function(){
            $.ajax({
                type: 'GET',
                url: '/service/xmpp',
                success: self.display.handlers.xmppListed,
                dataType: 'json',
                cache: false,
            });

            setTimeout(function(){self.display.refresh();}, 5000);
        },

        _getStatusObject: function(statusText){
            var c = {
                'PREAUTH': ['danger', '未登录'],
                'AUTH': ['default', '认证中'],
                'AUTHED': ['warning', '已认证'],
                'BIND': ['info', '登录中'],
                'SESSION': ['primary', '登录中'],
                'ONLINE': ['success', '已登录'],
            }[statusText];
            if(c == undefined)
                c = ['danger', '未知程序错误'];
            return $('<span>')
                .addClass('label label-' + c[0])
                .text(c[1])
            ;
        },

        _getFlowObject: function(up, down){
            return $('<span>')
                .append(
                    $('<span>').text(up)
                )
                .append(
                    $('<img>', {
                        src: 'static/images/up.png'
                    })
                )
                .append($('<span>').html('&nbsp;&nbsp;'))
                .append(
                    $('<span>').text(down)
                )
                .append(
                    $('<img>', {
                        src: 'static/images/down.png'
                    })
                )
            ;
        },

        data: function(data){
            var tbody = $('#xmpp-clients tbody[name="main-list"]');
            var jids = [];
            for(var jid in data){
                jids.push(jid);
                var corMain = tbody.find('tr[data-jidmain="' + jid + '"]');
                var news = data[jid];

                /* count roster for further use */
                var rosterJIDs = [];
                for(var buddyGroup in news.roster)
                    for(var buddyJID in news.roster[buddyGroup])
                        if(rosterJIDs.indexOf(buddyJID) < 0)
                            rosterJIDs.push(buddyJID);

                /* Create, or edit an account entry. */
                if(corMain.length < 1){
                    tbody.prepend(
                        $('<tr>', {'data-jidmain': jid})
                            /* Add Main Item */
                            .append( // #
                                $('<td>', {name: 'status'})
                                    .append(
                                        self.display._getStatusObject(
                                            news.client.status
                                        )
                                    )
                                    .css('vertical-align', 'middle')
                            )
                            .append( // Buddy
                                $('<td>')
                                    .append(
                                        $('<button>', {
                                            'name': 'buddy',
                                            'data-jid': jid,
                                        })
                                            .addClass('button btn-link')
                                            .css('vertical-align', 'middle')
                                            .text(rosterJIDs.length)
                                            .click(
                                                self
                                                    .display
                                                    .handlers
                                                    .onBuddylistClicked
                                            )
                                    )
                            )
                            .append( // JID
                                $('<td>', {name: 'jid'})
                                    .text(news.jid)
                                    .css('vertical-align', 'middle')
                            )
                            .append( // Password
                                $('<td>', {name: 'password'})
                                    .append(
                                        $('<input>', {
                                            'type': 'password',
                                            'name': 'pwd',
                                            'placeholder': '仅在登录时需要'
                                        })
                                            .addClass('form-control')
                                    )
                            )
                            .append( // Flow
                                $('<td>', {name: 'flow'})
                                    .append(
                                        self.display._getFlowObject(
                                            news.queue.send,
                                            news.queue.receive
                                        )
                                    )
                                    .css('vertical-align', 'middle')
                            )
                            .append( // Control
                                $('<td>', {name: 'control'})
                                    .append(
                                        $('<button>', {
                                            type: 'button',
                                            name: 'login',
                                        })
                                            .addClass('btn btn-success')
                                            .text('登录')
                                            .click(
                                                self
                                                    .display
                                                    .handlers
                                                    .onControlLogin
                                            )
                                    )
                                    .append(
                                        $('<button>', {
                                            type: 'button',
                                            name: 'logout',
                                        })
                                            .addClass('btn btn-danger')
                                            .text('退出')
                                            .click(
                                                self
                                                    .display
                                                    .handlers
                                                    .onControlLogout
                                            )
                                    )
                            )
                            /* Add Roster Region, default hidden. */
                            .add( 
                                $('<tr>', {'data-jidroster': jid})
                                    .append($('<td>'))
                                    .append(
                                        $('<td>', {colspan: 5})
                                            .append(
                                                $('<table>',{name: 'content'})
                                                    .addClass('table')
                                            )
                                    )
                                    .hide()
                            )
                            /* Done preparing a new entry. */
                    );
                } else {
                    /* Update displays in a entry main title. */
                    corMain.find('[name="status"]')
                        .empty()
                        .append(
                            self.display._getStatusObject(
                                news.client.status
                            )
                        )
                    ;
                    corMain.find('[name="jid"]').text(news.jid);
                    corMain.find('[name="buddy"]').text(rosterJIDs.length);
                    corMain.find('[name="flow"]')
                        .empty()
                        .append(
                            self.display._getFlowObject(
                                news.queue.send,
                                news.queue.receive
                            )
                        )
                    ;

                    /* Done updating a entry's displays. */
                } // if 

                /* Update Roster displays. */
                var corRosterContent =
                    tbody.find(
                        'tr[data-jidroster="' +
                        jid +
                        '"] table[name="content"]'
                    );
                for(var buddyGroup in news.roster)
                    for(var buddyJID in news.roster[buddyGroup]){
                        var buddyEntry = corRosterContent.find(
                            'tr[data-to="' + buddyJID + '"]'
                        );
                        var buddyItem = news.roster[buddyGroup][buddyJID];
                        var buddyText = buddyJID;
                        if(buddyItem.name)
                            buddyText =
                                buddyItem.name + ' <' + buddyText + '>';
                        if(buddyEntry.length < 1){
                            corRosterContent.append(
                                $('<tr>', {
                                    'data-to': buddyJID,
                                    'data-from': jid,
                                }).append(
                                    $('<td>')
                                        .text(buddyText)
                                        .click(
                                            self
                                                .display
                                                .handlers
                                                .onBuddyentryClicked
                                        )
                                )
                                .addClass('active')
                            );
                        } else {
                            // TODO update presence and other things.
                        }

                    }
                /* clean up roster list */
                corRosterContent.find('tr[data-to]').each(function(){
                    if(rosterJIDs.indexOf($(this).attr('data-to')) < 0)
                        $(this).remove();
                });

            } // for

            /* clean up jid entries list */
            tbody.find('tr[data-jidmain]').each(function(){
                if(jids.indexOf($(this).attr('data-jidmain')) < 0)
                    $(this).remove();
            });
        },

        handlers: {
            xmppListed: function(data, txtStatus, jqXHR){
                self.display.data(data);
            },

            onControlLogin: function(e){
                var tr = $(e.target).parents('[data-jidmain]');
                var jid = tr.attr('data-jidmain');
                var pwd = tr.find('[name="pwd"]').val();
                functions.xmpp.login(jid, pwd);
            },

            onControlLogout: function(e){
                var tr = $(e.target).parents('[data-jidmain]');
                functions.xmpp.logout(tr.attr('data-jidmain'));
            },

            onBuddylistClicked: function(e){
                var tr = $(e.target).parents('[data-jidmain]');
                var trRoster = tr.parents('table').find(
                    'tr[data-jidroster="' + tr.attr('data-jidmain') + '"]'
                );
                var rosterLines = trRoster.find('tr[data-to]');
                if(rosterLines.length < 1)
                    trRoster.hide();
                else
                    trRoster.toggle();
            },

            onBuddyentryClicked: function(e){
                $(e.target).parents('[data-to]')
                    .toggleClass('active success');
            },
        },
    };

    this.init = function(){
        var createForm = $('#xmpp-clients [name="create"]');
        createForm.find('[name="login"]').click(function(){
            functions.xmpp.login(
                createForm.find('[name="jid"]').val(),
                createForm.find('[name="pwd"]').val()
            )
            createForm.find('input[name]').val('');
        });
        
        var sendForm = $('#xmpp-clients [name="send"]');
        sendForm.find('[name="send"]').click(function(){
            var receivers = $('tr.success[data-to]');
            var results = [];
            var sendtext = sendForm.find('[name="message"]').val().trim();
            for(var i=0; i<receivers.length;i++)
                functions.xmpp.send(
                    $(receivers[i]).attr('data-from'),
                    $(receivers[i]).attr('data-to'),
                    sendtext
                );
        });

        self.display.refresh();
    };

    $(function(){self.init();});
}();
