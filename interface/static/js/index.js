var functions = {

    xmpp: {
        login: function(jid, pwd){
            $.ajax({
                type: "POST",
                url: '../service/xmpp/' + jid + '/login',
                data: {password: pwd},
                success: function(e){
                    
                },
                dataType: 'text',
            });
        },

        logout: function(jid){
            $.ajax({
                type: "GET",
                url: '../service/xmpp/' + jid + '/logout',
                success: function(e){
                    
                },
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

        data: function(data){
            var tbody = $('#xmpp-clients tbody');
            var jids = [];
            for(var jid in data){
                jids.push(jid);
                var cor = tbody.find('tr[data-jid="' + jid + '"]');
                var news = data[jid];
                if(cor.length < 1){
                    tbody.prepend(
                        $('<tr>', {'data-jid': jid})
                            .append(
                                $('<td>', {name: 'status'})
                                    .append(
                                        self.display._getStatusObject(
                                            news.client.status
                                        )
                                    )
                                    .css('vertical-align', 'middle')
                            )
                            .append(
                                $('<td>', {name: 'jid'})
                                    .text(news.jid)
                                    .css('vertical-align', 'middle')
                            )
                            .append(
                                $('<td>', {name: 'password'})
                                    .append(
                                        $('<input>', {
                                            'type': 'password',
                                            'name': 'pwd',
                                        })
                                            .addClass('form-control')
                                    )
                            )
                            .append(
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
                    );
                } else {
                    cor.find('[name="status"]')
                        .empty()
                        .append(
                            self.display._getStatusObject(
                                news.client.status
                            )
                        )
                    ;
                    cor.find('[name="jid"]').text(news.jid);
                }
            }

            tbody.find('tr[data-jid]').each(function(){
                if(jids.indexOf($(this).attr('data-jid')) < 0)
                    $(this).remove();
            });
        },

        handlers: {
            xmppListed: function(data, txtStatus, jqXHR){
                self.display.data(data);
            },

            onControlLogin: function(e){
                var tr = $(e.target).parents('[data-jid]');
                var jid = tr.attr('data-jid');
                var pwd = tr.find('[name="pwd"]').val();
                functions.xmpp.login(jid, pwd);
            },

            onControlLogout: function(e){
                var tr = $(e.target).parents('[data-jid]');
                functions.xmpp.logout(tr.attr('data-jid'));
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
        });

        self.display.refresh();
    };

    $(function(){self.init();});
}();
