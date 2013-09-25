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

        data: function(data){
            var tbody = $('#xmpp-clients tbody');
            var jids = [];
            for(var jid in data){
                jids.push(jid);
                var corresponding = tbody.find('tr[data-jid="' + jid + '"]');
                if(corresponding.length < 1){
                    tbody.prepend(
                        $('<tr>', {'data-jid': jid})
                            .append(
                                $('<td>', {name: 'status'})
                                    .text(data[jid].client.status)
                            )
                            .append(
                                $('<td>', {name: 'jid'})
                                    .text(data[jid].jid)
                            )
                            .append($('<td>', {name: 'password'}))
                            .append($('<td>', {name: 'control'}))
                    );
                } else {
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
