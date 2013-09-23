module.exports = {

    command: function(e, cmds){
        switch(cmds[0].toLowerCase()){
            case 'xmpp':
                this.xmpp.command(e, cmds.slice(1));
                break;
            default:
                e.output.error();
                break;
        }
    },

    xmpp: {
        
        command: function(e, cmds){
            e.output.write('ok');
        },

    },

}
