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
    include('camera.js');
    include('blobdetect.js');
    include('comment.js');
    include('scene.js');
    include('add.js');
    include('io.js');
    include('spline.js');
    include('multiplexer.js');

    blocks.types.addCompatibility('string', 'number');
    blocks.types.addCompatibility('string', 'bool');
    blocks.types.addCompatibility('bool', 'number');
    blocks.types.addCompatibility('bool', 'integer');
    blocks.types.addCompatibility('bool', 'string');

    blocks.run('#blocks');
    blocks.load(scene);

    blocks.ready(function() {
	blocks.menu.addAction('Export', function(blocks) {
	    alert($.toJSON(blocks.exportData()));
	}, 'export');

        $('.setLabel').click(function() {
            for (k in blocks.edges) {
                var edge = blocks.edges[k];
                edge.setLabel('Edge #'+edge.id);
            }
        });

        $('.setInfos').click(function() {
            for (k in blocks.blocks) {
                var block = blocks.blocks[k];
                block.setInfos('Hello, I am the block #'+block.id);
            }
        });

        $('.setDescriptions').click(function() {
            for (k in blocks.blocks) {
                var block = blocks.blocks[k];
                block.setDescription('This is the block #'+block.id);
            }
        });

        $('.resize').click(function() {
            $('#blocks').width('300px');
            blocks.perfectScale();
        });

        $('.hideIcons').click(function() {
            blocks.showIcons = false;
            blocks.redraw();
        });

        $('.stressTest').click(function() {
            for (var x=0; x<1000; x+=100) {
                for (var y=0; y<1000; y+=100) {
                    blocks.addBlock('Sinus', x, y);
                }
            }
        });
    });
})();
