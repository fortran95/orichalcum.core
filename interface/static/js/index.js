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
        keys: [],
        refresh: function(info){
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
    };

    $(function(){self.init();});
}();
