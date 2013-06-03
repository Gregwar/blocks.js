(function(){
    function include(file) {
        $('head').append('<script type="text/javascript" src="demo/'+file+'"></script>');
    }

    blocks = new Blocks();
    
    include('sin.js');
    include('gains.js');
    include('const.js');
    include('motor.js');
    include('time.js');
    include('comment.js');
    include('scene.js');
    include('add.js');
    include('io.js');
    include('spline.js');
    include('multiplexer.js');

    blocks.run('#blocks');
    blocks.load(scene);

    blocks.ready(function() {
	blocks.menu.addAction('Export', function(blocks) {
	    alert($.toJSON(blocks.exportData()));
	}, 'export');

        $('.setLabel').click(function() {
            labels = {}
            
            for (k in blocks.edges) {
                labels[k] = "Edge #"+k;
            }

            blocks.setLabels(labels);
        });

        $('.setInfos').click(function() {
            for (k in blocks.blocks) {
                var block = blocks.blocks[k];
                block.setInfos('Hello, I am the block #'+block.id);
            }
        });
    });
})();
