(function(){
    function include(file) {
        $('head').append('<script type="text/javascript" src="demo/'+file+'"></script>');
    }

    blocks = new Blocks;
    include('sin.js');
    include('gains.js');
    include('const.js');
    include('motor.js');
    include('time.js');
    include('comment.js');
    include('scene.js');

    blocks.run('#blocks');
    blocks.load(scene);

    blocks.ready(function() {
	blocks.menu.addAction('Export', function(blocks) {
	    alert($.toJSON(blocks.export()));
	});
    });
})();
