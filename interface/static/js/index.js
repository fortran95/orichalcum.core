var functions = {

    xmpp_login: function(){
        var jid = $('#xmpp-controller [name="jid"]').val();
        var pwd = $('#xmpp-controller [name="password"]').val();
        $.ajax({
            type: "POST",
            url: '../service/xmpp/' + jid + '/login',
            data: {password: pwd},
            success: function(e){
                
            },
            dataType: 'text',
        });
    },

    xmpp_logout: function(){
        var jid = $('#xmpp-controller [name="jid"]').val();
        $.ajax({
            type: "GET",
            url: '../service/xmpp/' + jid + '/logout',
            success: function(e){
                
            },
            dataType: 'text',
        });
    },

};

$(function(){
    $('#xmpp-controller button[name="login"]').click(
        functions.xmpp_login
    );

    $('#xmpp-controller button[name="logout"]').click(
        functions.xmpp_logout
    );
});
