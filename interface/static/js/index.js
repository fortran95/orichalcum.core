var functions = {

    xmpp_login: function(jid, pwd){
        $.ajax({
            type: "POST",
            url: '../service/xmpp/' + jid + '/login',
            data: {password: pwd},
            success: function(e){
                
            },
            dataType: 'text',
        });
    },

    xmpp_logout: function(jid){
        $.ajax({
            type: "GET",
            url: '../service/xmpp/' + jid + '/logout',
            success: function(e){
                
            },
            dataType: 'text',
        });
    },

};

