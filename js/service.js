module.exports = {

    list: {
        xmpp: {},
    },

    command: function(e, cmds){
        if(cmds[0] == undefined){
            e.output.error();
            return;
        }

        switch(cmds[0].toLowerCase()){
            case 'xmpp':
                this.xmpp.command(e, cmds.slice(1));
                break;
            default:
                e.output.error();
                break;
        }
    },

    xmpp: require('./service.xmpp.js'),

}
