module.exports = {

    command: function(e, url){
        var pathname = x.string.url.parse(url).pathname;

        if(!pathname) pathname = 'index.html';

        var filePath = x.string.path.resolve(
            '.',
            'interface',
            pathname
        );

        if(filePath.indexOf(x.string.path.resolve('.')) != 0){
            e.output.w401();
            return;
        }

        var extname = x.string.path.extname(pathname);
        var outputMethod = '';
        for(var suggested in this.config.contentTypes){
            if(this.config.contentTypes[suggested].indexOf(extname) >= 0){
                outputMethod = suggested;
                break;
            }
        }
        if(outputMethod == '') outputMethod = 'w200';

        x.io.fileSystem.readFile(filePath, function(err, data){
            if(err)
                e.output.w404();
            else
                e.output[outputMethod](data);
        });
    },

    config: {
        
        contentTypes: {
            'w200html': ['.html', '.htm'],
            'w200': ['.ico'],
        },

    },

};
