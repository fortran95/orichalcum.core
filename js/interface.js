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
            e.output.write('Access Denied.');
            return;
        }

        x.io.fileSystem.readFile(filePath, function(err, data){
            if(err)
                e.output.write('Access Error.');
            else
                e.output.write(data);
        });
    },

    config: {
        
        contentTypes: {
            'text/html': ['.html', '.htm'],
        },

    },

};
